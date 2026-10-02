import type { AdminProfile } from './admin';

export function canManageAdministration(profile: AdminProfile | null) {
  return profile?.experience_type === 'AMBASSADOR' && profile.platform_role === 'OWNER';
}

export function canDemoteOwner(ownerCount: number) {
  return ownerCount > 1;
}

export function isValidExperience(value: unknown): value is 'CLIENT_VIP' | 'AMBASSADOR' {
  return value === 'CLIENT_VIP' || value === 'AMBASSADOR';
}

export function isValidPlatformRole(value: unknown): value is 'OWNER' | 'ADMIN' | 'MEMBER' {
  return value === 'OWNER' || value === 'ADMIN' || value === 'MEMBER';
}

export function isRoleExperienceConsistent(experience: 'CLIENT_VIP' | 'AMBASSADOR', role: 'OWNER' | 'ADMIN' | 'MEMBER') {
  return experience === 'AMBASSADOR' || role === 'MEMBER';
}

export function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function canDeleteTarget(actorRole: 'OWNER' | 'ADMIN' | 'MEMBER', targetRole: 'OWNER' | 'ADMIN' | 'MEMBER', sameUser = false) {
  if (sameUser || targetRole === 'OWNER') return false;
  if (actorRole === 'OWNER') return targetRole === 'ADMIN' || targetRole === 'MEMBER';
  if (actorRole === 'ADMIN') return targetRole === 'MEMBER';
  return false;
}
