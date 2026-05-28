/**
 * Environment configuration. Vite exposes env vars prefixed with VITE_.
 */
const identityBaseUrl = import.meta.env.VITE_API_IDENTITY_URL
const englishBaseUrl = import.meta.env.VITE_API_ENGLISH_URL
const phrasalVerbsBaseUrl = import.meta.env.VITE_API_PHRASAL_VERBS_URL
const prepositionsBaseUrl = import.meta.env.VITE_API_PREPOSITIONS_URL
const chatPracticeBaseUrl = import.meta.env.VITE_API_CHAT_PRACTICE_URL
const deutschBaseUrl = import.meta.env.VITE_API_DEUTSCH_URL

function cleanUrl(raw: unknown): string {
  return typeof raw === 'string' && raw ? raw.replace(/\/$/, '') : ''
}

export const env = {
  /** Base URL for the Identity Service (e.g. http://localhost:8000) */
  apiIdentityUrl: cleanUrl(identityBaseUrl),
  /** Base URL for the unified English Service (e.g. http://localhost:8010) */
  apiEnglishUrl: cleanUrl(englishBaseUrl),
  /** Legacy fallback; phrasal/prepositions/chat API calls use apiEnglishUrl when set */
  apiPhrasalVerbsUrl: cleanUrl(phrasalVerbsBaseUrl),
  apiPrepositionsUrl: cleanUrl(prepositionsBaseUrl),
  apiChatPracticeUrl: cleanUrl(chatPracticeBaseUrl),
  /** Base URL for the Deutsch Service (e.g. http://localhost:8006) */
  apiDeutschUrl: cleanUrl(deutschBaseUrl),
} as const
