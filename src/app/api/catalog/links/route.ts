import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { catalogProducts } from '@/lib/catalog/products';
import { token } from '@/lib/catalog/tracking';

const publicCatalog = 'https://catalogo-zilis.vercel.app';
export async function GET() {
  const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ message: 'No autenticado.' }, { status: 401 });
  const admin = createAdminClient(); const { data, error } = await admin.from('catalog_links').select('id,token,recipient_label,label,target_type,product_slug,destination_url,status,created_at,total_sessions,total_opens,total_product_views,first_seen_at,last_seen_at').eq('owner_user_id', user.id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ message: 'No pudimos cargar tus compartidos.' }, { status: 500 }); return NextResponse.json({ links: data ?? [] });
}
export async function POST(request: Request) {
  const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ message: 'No autenticado.' }, { status: 401 });
  const body = await request.json().catch(() => ({})); const recipientLabel = typeof body.recipientLabel === 'string' ? body.recipientLabel.trim().slice(0, 120) : ''; const label = typeof body.label === 'string' ? body.label.trim().slice(0, 120) || null : null; const targetType = body.targetType === 'PRODUCT' ? 'PRODUCT' : 'CATALOG'; const productSlug = targetType === 'PRODUCT' && typeof body.productSlug === 'string' ? body.productSlug : null;
  if (!recipientLabel) return NextResponse.json({ code: 'RECIPIENT_REQUIRED', message: 'Escribe un nombre o referencia para este enlace.', field: 'recipientLabel' }, { status: 400 });
  if (targetType === 'PRODUCT' && !catalogProducts.some((product) => product.slug === productSlug)) return NextResponse.json({ code: 'INVALID_PRODUCT', message: 'Selecciona un producto válido.' }, { status: 400 });
  const admin = createAdminClient(); let contactId: string | null = null;
  if (typeof body.contactId === 'string' && body.contactId) { const { data: contact } = await admin.from('profiles').select('id,experience_type,sponsor_id,advisor_id').eq('id', body.contactId).maybeSingle(); if (!contact || (contact.experience_type === 'AMBASSADOR' && contact.sponsor_id !== user.id) || (contact.experience_type === 'CLIENT_VIP' && contact.advisor_id !== user.id)) return NextResponse.json({ code: 'INVALID_CONTACT', message: 'No puedes asociar este enlace a esa persona.' }, { status: 403 }); contactId = contact.id; }
  const linkToken = token(); const destination = targetType === 'PRODUCT' ? `${publicCatalog}/productos/${productSlug}?ref=${encodeURIComponent(linkToken)}` : `${publicCatalog}/?ref=${encodeURIComponent(linkToken)}`;
  const { data: link, error } = await admin.from('catalog_links').insert({ slug: linkToken, token: linkToken, owner_user_id: user.id, contact_id: contactId, recipient_label: recipientLabel, label, target_type: targetType, product_slug: productSlug, destination_url: destination, status: 'ACTIVE', link_type: targetType, cta: 'Compartir catálogo' }).select('id,token,recipient_label,label,target_type,product_slug,destination_url,status,created_at,total_sessions,total_opens,total_product_views,first_seen_at,last_seen_at').single();
  if (error || !link) return NextResponse.json({ message: 'No pudimos crear el enlace. Intenta nuevamente.' }, { status: 500 });
  return NextResponse.json({ link: { ...link, shareUrl: `https://elite-focus-platform.vercel.app/v/${link.token}` }, shareUrl: `https://elite-focus-platform.vercel.app/v/${link.token}` }, { status: 201 });
}
