/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Outils de double authentification (TOTP — Google / Microsoft Authenticator).
 *              Lisent les claims `aal` / `amr` du JWT Supabase et les facteurs MFA de
 *              l'utilisateur pour décider si une session a bien franchi la 2FA.
 * @created 2026-10-08
 */

import type { User } from '@supabase/supabase-js';

export interface AuthClaims {
  /** Niveau d'assurance : aal1 (mot de passe / OAuth) ou aal2 (2FA validée). */
  aal?: 'aal1' | 'aal2';
  /** Méthodes d'authentification utilisées pendant la session, horodatées (secondes). */
  amr?: { method: string; timestamp: number }[];
}

/**
 * Décode la charge utile d'un JWT SANS vérifier la signature.
 * À n'appeler qu'après `supabase.auth.getUser(token)`, qui a déjà validé le jeton.
 */
export function decodeJwtClaims(token: string): AuthClaims {
  try {
    const payload = token.split('.')[1];
    if (!payload) return {};
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthClaims;
  } catch {
    return {};
  }
}

/** L'utilisateur a-t-il une application d'authentification (TOTP) vérifiée ? */
export function hasVerifiedTotp(user: Pick<User, 'factors'> | null | undefined): boolean {
  return !!user?.factors?.some((f) => f.factor_type === 'totp' && f.status === 'verified');
}

/**
 * Le code TOTP a-t-il été saisi récemment dans cette session ?
 * Sert de preuve d'identité « fraîche » pour les actions sensibles (changer le PIN…),
 * au même titre que la saisie de l'ancien PIN.
 */
export function hasRecentTotp(claims: AuthClaims, maxAgeSeconds = 300, nowMs = Date.now()): boolean {
  if (claims.aal !== 'aal2') return false;
  const totp = (claims.amr || []).filter((m) => m.method === 'totp');
  if (totp.length === 0) return false;
  const latest = Math.max(...totp.map((m) => m.timestamp));
  return nowMs / 1000 - latest <= maxAgeSeconds;
}
