import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FollowupsPanel } from '@/components/followups/followups-panel';
export default async function FollowupsPage(){const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');const {data}=await supabase.from('followups').select('id,context,scheduled_for,status').eq('user_id',user.id).order('scheduled_for',{ascending:true});return <FollowupsPanel initial={(data??[]) as never[]}/>}
