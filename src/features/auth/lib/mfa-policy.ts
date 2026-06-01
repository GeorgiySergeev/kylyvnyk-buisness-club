export interface MfaAssuranceLevel {
  currentLevel?: string | null;
}

export function isMfaVerifiedFromAssuranceLevel(
  assuranceLevel: MfaAssuranceLevel | null | undefined,
) {
  return assuranceLevel?.currentLevel === 'aal2';
}
