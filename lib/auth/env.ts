/**
 * Neon Auth settings. Missing values put the app in preview mode: the board
 * renders, the guard stands down, and no auth instance is constructed.
 *
 * NEON_AUTH_BASE_URL  Neon Console -> your project -> Auth -> Configuration
 * NEON_AUTH_COOKIE_SECRET  generate with: openssl rand -base64 32
 */
export const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL ?? "";
export const NEON_AUTH_COOKIE_SECRET = process.env.NEON_AUTH_COOKIE_SECRET ?? "";

export function isAuthConfigured(): boolean {
  return NEON_AUTH_BASE_URL.length > 0 && NEON_AUTH_COOKIE_SECRET.length >= 32;
}
