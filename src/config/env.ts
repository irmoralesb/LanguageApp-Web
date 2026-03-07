/**
 * Environment configuration. Vite exposes env vars prefixed with VITE_.
 */
const identityBaseUrl = import.meta.env.VITE_API_IDENTITY_URL
const phrasalVerbsBaseUrl = import.meta.env.VITE_API_PHRASAL_VERBS_URL

function cleanUrl(raw: unknown): string {
  return typeof raw === 'string' && raw ? raw.replace(/\/$/, '') : ''
}

export const env = {
  /** Base URL for the Identity Service (e.g. http://localhost:8000) */
  apiIdentityUrl: cleanUrl(identityBaseUrl),
  /** Base URL for the Phrasal Verbs Service (e.g. http://localhost:8001) */
  apiPhrasalVerbsUrl: cleanUrl(phrasalVerbsBaseUrl),
} as const
