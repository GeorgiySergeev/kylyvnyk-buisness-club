import 'server-only';

import { auth } from '@clerk/nextjs/server';

type SessionClaimsWithMfa = {
  factorVerificationAge?: [number, number];
  fva?: [number, number];
};

function getSecondFactorAge(claims: SessionClaimsWithMfa | null | undefined) {
  const fva = claims?.fva ?? claims?.factorVerificationAge;

  if (!Array.isArray(fva) || fva.length < 2) {
    return -1;
  }

  const secondFactorAge = Number(fva[1]);
  return Number.isFinite(secondFactorAge) ? secondFactorAge : -1;
}

export async function hasVerifiedMfaInSession() {
  const { sessionClaims } = await auth();
  const secondFactorAge = getSecondFactorAge(
    sessionClaims as SessionClaimsWithMfa | null | undefined,
  );

  return secondFactorAge >= 0;
}

