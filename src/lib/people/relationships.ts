export type DirectRelationship = { sponsor_id: string | null; advisor_id: string | null };

export function hasDirectPeople(userId: string, people: DirectRelationship[]) {
  return people.some((person) => person.sponsor_id === userId || person.advisor_id === userId);
}

export function isTeamVisible(experienceType: string | null | undefined, userId: string, people: DirectRelationship[]) {
  return experienceType === 'AMBASSADOR' && hasDirectPeople(userId, people);
}
