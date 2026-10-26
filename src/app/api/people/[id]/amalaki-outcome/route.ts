import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trackEvent } from '@/lib/events';
import { AMALAKI_OUTCOMES, mapAmalakiOutcome } from '@/lib/people/amalaki-outcomes';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!AMALAKI_OUTCOMES.includes(body.outcome)) return NextResponse.json({ error: 'Resultado no válido' }, { status: 400 });
  if (body.scheduledFor && Number.isNaN(Date.parse(body.scheduledFor))) return NextResponse.json({ error: 'La fecha del seguimiento no es válida.' }, { status: 400 });

  const admin = createAdminClient();
  const { data: person } = await admin.from('profiles').select('id,first_name,last_name').eq('id', params.id).or(`sponsor_id.eq.${user.id},advisor_id.eq.${user.id}`).maybeSingle();
  if (!person) return NextResponse.json({ error: 'Persona no encontrada.' }, { status: 404 });
  const mapping = mapAmalakiOutcome(body.outcome);
  if (mapping.followupContext && !body.scheduledFor) return NextResponse.json({ error: 'Elige cuándo quieres retomar esta conversación.' }, { status: 400 });
  const { data: contact, error: contactError } = await supabase.from('contacts').insert({ owner_id: user.id, name: `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim(), context: `Conversación sobre Amalaki · ${body.outcome}`, stage: mapping.stage, next_step: mapping.nextStep }).select('id').single();
  if (contactError) return NextResponse.json({ error: 'No pudimos registrar esta conversación.' }, { status: 400 });

  let followupId: string | null = null;
  if (mapping.followupContext) {
    const { data: followup, error: followupError } = await supabase.from('followups').insert({ owner_id: user.id, user_id: user.id, contact_id: contact.id, due_at: body.scheduledFor, scheduled_for: body.scheduledFor, context: mapping.followupContext, status: 'PENDING' }).select('id').single();
    if (followupError) return NextResponse.json({ error: 'Guardamos la conversación, pero no pudimos crear el seguimiento.' }, { status: 400 });
    followupId = followup.id;
  }
  await trackEvent(user.id, 'product_person_selected', { product: 'AMALAKI', personId: person.id, outcome: body.outcome, contactId: contact.id, followupId });
  return NextResponse.json({ ok: true, contactId: contact.id, followupId, nextStep: mapping.nextStep });
}
