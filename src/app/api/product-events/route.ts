import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { productEventNames, trackProductEvent } from '@/lib/catalog/product-events';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!productEventNames.includes(body.eventName)) return NextResponse.json({ error: 'Evento no permitido' }, { status: 400 });
  await trackProductEvent(user.id, body.eventName, { market: body.market, section: body.section });
  return NextResponse.json({ ok: true });
}
