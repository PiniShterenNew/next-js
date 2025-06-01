// lib/clerk/getClerkErrorMessage.ts
export function getClerkErrorMessage(
  code: string | undefined,
  context:
    | 'signIn'
    | 'signUp'
    | 'forgotPassword'
    | 'verification'
    | 'oauth'
    | 'general',
  t: (key: string) => string
): string {
  if (!code) return t('general.unknown')

  const key = `${context}.${mapClerkErrorCode(code)}`
  const translation = t(key)

  // אם לא מצא תרגום - fallback כללי
  if (translation === key) return t('general.unknown')
  return translation
}

// פונקציה פנימית: מיפוי של קוד שגיאה לפורמט המפתח שלנו
function mapClerkErrorCode(code: string): string {
  const mapping: Record<string, string> = {
    'form_identifier_not_found': 'accountNotFound',
    'form_password_incorrect': 'invalidPassword',
    'form_identifier_exists': 'identifierExists',
    'form_identifier_already_linked': 'identifierAlreadyLinked',
    'form_password_length_too_short': 'passwordTooShort',
    'form_password_pwned': 'weakPassword',
    'form_param_exceeds_max_length': 'tooManyAttempts',
    'form_code_incorrect': 'codeIncorrect',
    'form_code_expired': 'codeExpired',
    'form_not_allowed': 'notAllowed',
    'session_exists': 'sessionExists',
    'form_param_format_invalid': 'invalidFormat',
    'form_password_not_strong_enough': 'weakPassword',
    'not_allowed_to_sign_up': 'signUpNotAllowed',
    'identifier_not_found': 'accountNotFound',
    'not_linked_to_oauth': 'notLinked',
    'oauth_callback_error': 'googleError',
    'verification_failed': 'verificationFailed',
    'email_address_not_verified': 'emailNotVerified',
    'token_expired': 'tokenExpired',
    'token_invalid': 'tokenInvalid'
  }

  return mapping[code] ?? code
}

