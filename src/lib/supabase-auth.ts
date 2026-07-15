export const SUPABASE_PROJECT_REF = 'ybryfngubxamphvtxynp';
export const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

export function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
}

export function buildSupabaseGoogleOAuthUrl(origin: string): string {
  const authorizeUrl = new URL('/auth/v1/authorize', getSupabaseUrl());
  authorizeUrl.searchParams.set('provider', 'google');
  authorizeUrl.searchParams.set('redirect_to', `${origin}/auth/callback`);
  return authorizeUrl.toString();
}
