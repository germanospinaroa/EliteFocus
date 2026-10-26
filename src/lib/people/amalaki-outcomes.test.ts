import { describe, expect, it } from 'vitest';
import { mapAmalakiOutcome } from './amalaki-outcomes';

describe('Amalaki conversation outcomes', () => {
  it('creates a next action for interest', () => expect(mapAmalakiOutcome('INTERESTED')).toMatchObject({ stage: 'RECOMMENDATION', nextStep: expect.any(String), followupContext: null }));
  it('creates a contextual follow-up for questions, price, thinking and no response', () => {
    for (const outcome of ['QUESTIONS', 'PRICE', 'THINKING', 'NO_RESPONSE'] as const) expect(mapAmalakiOutcome(outcome).followupContext).toContain('Amalaki');
  });
  it('closes respectfully when there is no interest', () => expect(mapAmalakiOutcome('NOT_INTERESTED')).toEqual({ stage: 'CLOSED', nextStep: null, followupContext: null }));
});
