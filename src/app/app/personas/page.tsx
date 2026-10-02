import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PeoplePanel } from '@/components/people/people-panel';
export default async function PeoplePage(){const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');const admin=createAdminClient();const {data:profile}=await admin.from('profiles').select('experience_type').eq('id',user.id).single();if(profile?.experience_type!=='AMBASSADOR')redirect('/app');const {data}=await admin.from('profiles').select('id,first_name,last_name,username,zilis_id,email,experience_type,must_change_password,created_at,sponsor_id,advisor_id').or(`sponsor_id.eq.${user.id},advisor_id.eq.${user.id}`).order('created_at',{ascending:false});return <PeoplePanel initial={(data??[]).map((person)=>({...person,status:person.must_change_password?'PENDIENTE':'ACTIVO'}))}/>}
