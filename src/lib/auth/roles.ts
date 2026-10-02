export type ExperienceType = 'CLIENT_VIP' | 'AMBASSADOR';
export type PlatformRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type AppRole = ExperienceType | PlatformRole;
export const canCreateUsers = (experience: ExperienceType, role: PlatformRole) => experience === 'AMBASSADOR' && ['OWNER', 'ADMIN', 'MEMBER'].includes(role);
export const canSeeTeam = (experience: ExperienceType, hasDirectPeople: boolean) => experience === 'AMBASSADOR' && hasDirectPeople;
export const canAccessAdmin = (experience: ExperienceType, role: PlatformRole) => experience === 'AMBASSADOR' && (role === 'OWNER' || role === 'ADMIN');
