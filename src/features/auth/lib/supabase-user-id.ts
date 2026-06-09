/**
 * Dev bypass stores synthetic ids (`dev:+380...`) in users.supabase_user_id.
 * They are not Supabase Auth users and must not block real SMS OTP claim.
 */
export function isRealSupabaseUserId(supabaseUserId: string | null | undefined): boolean {
  if (!supabaseUserId) {
    return false;
  }

  return !supabaseUserId.startsWith('dev:');
}
