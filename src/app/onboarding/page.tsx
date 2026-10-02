import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/components/auth/onboarding-wizard';
export default async function OnboardingPage(){ const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect('/login'); const {data:profile}=await supabase.from('profiles').select('experience_type,first_name,last_name').eq('id',user.id).single(); return <OnboardingWizard experienceType={profile?.experience_type === 'CLIENT_VIP' ? 'CLIENT_VIP' : 'AMBASSADOR'} firstName={profile?.first_name ?? ''} lastName={profile?.last_name ?? ''} />; }
