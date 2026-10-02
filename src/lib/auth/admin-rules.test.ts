import { describe, expect, it } from 'vitest';
import { canDeleteTarget, canDemoteOwner, canManageAdministration, isRoleExperienceConsistent, isValidEmailAddress, isValidExperience, isValidPlatformRole } from './admin-rules';

const owner = { id: '1', first_name: 'Owner', last_name: null, email: null, experience_type: 'AMBASSADOR' as const, platform_role: 'OWNER' as const };
const admin = { ...owner, platform_role: 'ADMIN' as const };
const member = { ...owner, platform_role: 'MEMBER' as const };

describe('administrative rules', () => {
  it('only lets an owner manage protected user settings', () => {
    expect(canManageAdministration(owner)).toBe(true);
    expect(canManageAdministration(admin)).toBe(false);
    expect(canManageAdministration(member)).toBe(false);
  });

  it('protects the last owner', () => {
    expect(canDemoteOwner(1)).toBe(false);
    expect(canDemoteOwner(2)).toBe(true);
  });

  it('accepts only the two experience types and three platform roles', () => {
    expect(isValidExperience('CLIENT_VIP')).toBe(true);
    expect(isValidExperience('LEADER')).toBe(false);
    expect(isValidPlatformRole('OWNER')).toBe(true);
    expect(isValidPlatformRole('LEADER')).toBe(false);
  });

  it('keeps administrative roles inside the ambassador experience', () => {
    expect(isRoleExperienceConsistent('CLIENT_VIP', 'MEMBER')).toBe(true);
    expect(isRoleExperienceConsistent('CLIENT_VIP', 'ADMIN')).toBe(false);
    expect(isRoleExperienceConsistent('CLIENT_VIP', 'OWNER')).toBe(false);
    expect(isRoleExperienceConsistent('AMBASSADOR', 'MEMBER')).toBe(true);
  });

  it('validates editable email addresses', () => {
    expect(isValidEmailAddress('person@example.com')).toBe(true);
    expect(isValidEmailAddress('not-an-email')).toBe(false);
  });

  it('protects deletion targets by role', () => {
    expect(canDeleteTarget('OWNER', 'MEMBER')).toBe(true);
    expect(canDeleteTarget('OWNER', 'ADMIN')).toBe(true);
    expect(canDeleteTarget('OWNER', 'OWNER')).toBe(false);
    expect(canDeleteTarget('ADMIN', 'MEMBER')).toBe(true);
    expect(canDeleteTarget('ADMIN', 'ADMIN')).toBe(false);
    expect(canDeleteTarget('MEMBER', 'MEMBER')).toBe(false);
    expect(canDeleteTarget('OWNER', 'MEMBER', true)).toBe(false);
  });
});
