export type OwnerProfile = { id: string; zilis_id: string | null; experience_type: string | null; platform_role: string | null; created_by_user_id: string | null; sponsor_id: string | null; advisor_id: string | null };
export type OwnerBootstrapAction = 'create' | 'adopt' | 'promote' | 'idempotent' | 'conflict-email-profile' | 'conflict-zilis';

export function classifyOwnerBootstrap({ authUserId, authProfile, targetProfileId, targetZilisId }: { authUserId: string | null; authProfile: OwnerProfile | null; targetProfileId: string | null; targetZilisId: string }): OwnerBootstrapAction {
  if (authProfile?.zilis_id && authProfile.zilis_id !== targetZilisId) return 'conflict-email-profile';
  if (targetProfileId && targetProfileId !== authUserId) return 'conflict-zilis';
  if (authProfile?.zilis_id === targetZilisId && authProfile.experience_type === 'AMBASSADOR' && authProfile.platform_role === 'OWNER' && !authProfile.created_by_user_id && !authProfile.sponsor_id && !authProfile.advisor_id) return 'idempotent';
  if (!authUserId) return 'create';
  return authProfile ? 'promote' : 'adopt';
}
