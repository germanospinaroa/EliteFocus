import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackEvent } from '@/lib/events';
export async function POST(request:Request){ const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:'No autenticado'},{status:401}); const body=await request.json(); const {error}=await supabase.from('actions').update({status:'COMPLETED',completed_at:new Date().toISOString()}).eq('id',body.actionId).eq('user_id',user.id); if(error)return NextResponse.json({error:'No pudimos completar la acción.'},{status:400}); await trackEvent(user.id,'next_action_completed',{actionId:body.actionId}); return NextResponse.json({ok:true}); }
