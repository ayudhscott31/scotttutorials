import type { PostgrestError } from '@supabase/supabase-js';

export function formatSupabaseError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Something went wrong. Please try again.';
  }

  const e = error as PostgrestError;
  const parts = [e.message, e.details, e.hint].filter(Boolean);

  if (e.code === '23514') {
    return 'Invalid data (check slug uses only lowercase letters, numbers, and hyphens).';
  }
  if (e.code === '22P02') {
    return 'Database schema mismatch. Run supabase/migrations/003_fix_platform_slug.sql in Supabase SQL Editor.';
  }
  if (e.code === '23505') {
    return 'This slug already exists. Choose a different slug.';
  }
  if (e.message?.includes('row-level security')) {
    return 'Permission denied. Sign out and sign in again, or run bootstrap-admin.sql in Supabase.';
  }
  if (e.code === 'PGRST116') {
    return 'Save blocked by permissions. Confirm your account is in admin_users.';
  }

  return parts.join(' — ') || 'Request failed';
}
