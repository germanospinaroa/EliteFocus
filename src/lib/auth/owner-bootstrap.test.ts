import { describe, expect, it } from 'vitest';
import { classifyOwnerBootstrap } from './owner-bootstrap';

const owner = { id: 'auth-1', zilis_id: '3608893', experience_type: 'AMBASSADOR', platform_role: 'OWNER', created_by_user_id: null, sponsor_id: null, advisor_id: null };

describe('owner bootstrap decisions', () => {
  it('creates when Auth and zilis ID are unused', () => expect(classifyOwnerBootstrap({ authUserId: null, authProfile: null, targetProfileId: null, targetZilisId: '3608893' })).toBe('create'));
  it('adopts an Auth user with no profile', () => expect(classifyOwnerBootstrap({ authUserId: 'auth-1', authProfile: null, targetProfileId: null, targetZilisId: '3608893' })).toBe('adopt'));
  it('promotes an existing profile with an empty or matching zilis ID', () => expect(classifyOwnerBootstrap({ authUserId: 'auth-1', authProfile: { ...owner, zilis_id: null }, targetProfileId: null, targetZilisId: '3608893' })).toBe('promote'));
  it('is idempotent for a correctly configured owner', () => expect(classifyOwnerBootstrap({ authUserId: 'auth-1', authProfile: owner, targetProfileId: 'auth-1', targetZilisId: '3608893' })).toBe('idempotent'));
  it('stops on an email profile with another zilis ID', () => expect(classifyOwnerBootstrap({ authUserId: 'auth-1', authProfile: { ...owner, zilis_id: 'other' }, targetProfileId: null, targetZilisId: '3608893' })).toBe('conflict-email-profile'));
  it('stops when the requested zilis ID belongs to another Auth user', () => expect(classifyOwnerBootstrap({ authUserId: 'auth-1', authProfile: null, targetProfileId: 'auth-2', targetZilisId: '3608893' })).toBe('conflict-zilis'));
});
