export const AMALAKI_OUTCOMES = ['INTERESTED', 'QUESTIONS', 'PRICE', 'THINKING', 'NOT_INTERESTED', 'NO_RESPONSE'] as const;
export type AmalakiOutcome = typeof AMALAKI_OUTCOMES[number];

export type AmalakiOutcomeMapping = {
  stage: 'RECOMMENDATION' | 'FOLLOWUP' | 'CLOSED';
  nextStep: string | null;
  followupContext: string | null;
};

export function mapAmalakiOutcome(outcome: AmalakiOutcome): AmalakiOutcomeMapping {
  switch (outcome) {
    case 'INTERESTED': return { stage: 'RECOMMENDATION', nextStep: 'Continuar la conversación sobre Amalaki', followupContext: null };
    case 'QUESTIONS': return { stage: 'FOLLOWUP', nextStep: 'Resolver las preguntas sobre Amalaki', followupContext: 'Retomar preguntas sobre Amalaki' };
    case 'PRICE': return { stage: 'FOLLOWUP', nextStep: 'Compartir el precio confirmado de Amalaki', followupContext: 'Confirmar y compartir el precio de Amalaki' };
    case 'THINKING': return { stage: 'FOLLOWUP', nextStep: 'Volver a conversar sobre Amalaki cuando sea oportuno', followupContext: 'Dar espacio y retomar Amalaki' };
    case 'NO_RESPONSE': return { stage: 'FOLLOWUP', nextStep: 'Intentar un seguimiento amable', followupContext: 'Hacer un seguimiento amable sobre Amalaki' };
    case 'NOT_INTERESTED': return { stage: 'CLOSED', nextStep: null, followupContext: null };
  }
}
