/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Flag local temporaire : menu authentifié sans session (jamais en production).
 */

export const isDevAuthBypass =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true"
