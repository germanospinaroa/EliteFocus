import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recordCatalogEvent, sessionId } from '@/lib/catalog/tracking';
export async function GET(_request: Request, { params }: { params: { token: string } }) { const admin = createAdminClient(); const { data: link } = await admin.from('catalog_links').select('token,status,destination_url').eq('token', params.token).maybeSingle(); if (!link || link.status !== 'ACTIVE') return new NextResponse('<!doctype html><title>Enlace no disponible</title><main style="font-family:system-ui;padding:3rem"><h1>Este enlace ya no está disponible.</h1></main>', { status: 410, headers: { 'content-type': 'text/html; charset=utf-8' } }); await recordCatalogEvent({ token: link.token, eventType: 'LINK_OPENED', sessionId: sessionId() }); return NextResponse.redirect(link.destination_url);
}
