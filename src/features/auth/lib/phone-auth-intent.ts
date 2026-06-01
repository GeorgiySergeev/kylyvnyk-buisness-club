export type AuthIntent = 'sign-in' | 'sign-up';

export type AuthIntentErrorCode = 'ACCOUNT_ALREADY_EXISTS' | 'ACCOUNT_NOT_FOUND';

export function getAuthIntentError(
  intent: AuthIntent,
  hasExistingAccount: boolean,
): AuthIntentErrorCode | null {
  if (intent === 'sign-in' && !hasExistingAccount) {
    return 'ACCOUNT_NOT_FOUND';
  }

  if (intent === 'sign-up' && hasExistingAccount) {
    return 'ACCOUNT_ALREADY_EXISTS';
  }

  return null;
}

export function getAuthErrorLink(errorCode: AuthIntentErrorCode): '/sign-in' | '/sign-up' {
  return errorCode === 'ACCOUNT_NOT_FOUND' ? '/sign-up' : '/sign-in';
}
