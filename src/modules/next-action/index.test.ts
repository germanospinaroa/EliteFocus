import { describe, expect, it } from 'vitest';
import { getNextAction } from './index';

const base = { role:'ambassador', currentStage:'PRACTICE', onboardingCompleted:true, milestones:[], pendingFollowups:0, openContactsWithoutNextStep:0 };
describe('Next Action Engine', () => {
  it('prioritizes followups over practice', () => expect(getNextAction({...base,pendingFollowups:1}).actionType).toBe('COMPLETE_FOLLOWUP'));
  it('asks for first practice in PRACTICE', () => expect(getNextAction(base).actionType).toBe('PRACTICE_FIRST_CONVERSATION'));
  it('moves to first action after practice milestone', () => expect(getNextAction({...base,milestones:['FIRST_PRACTICE']}).actionType).toBe('TAKE_FIRST_ACTION'));
  it('does not repeat onboarding after completion', () => expect(getNextAction({...base,onboardingCompleted:false}).actionType).toBe('COMPLETE_ONBOARDING'));
});
