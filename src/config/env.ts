/**
 * Environment configuration. Vite exposes env vars prefixed with VITE_.
 */
const identityBaseUrl = import.meta.env.VITE_API_IDENTITY_URL
const phrasalVerbsBaseUrl = import.meta.env.VITE_API_PHRASAL_VERBS_URL
const prepositionsBaseUrl = import.meta.env.VITE_API_PREPOSITIONS_URL
const chatPracticeBaseUrl = import.meta.env.VITE_API_CHAT_PRACTICE_URL
const germanNounsBaseUrl = import.meta.env.VITE_API_GERMAN_NOUNS_URL
const germanVerbsBaseUrl = import.meta.env.VITE_API_GERMAN_VERBS_URL

function cleanUrl(raw: unknown): string {
  return typeof raw === 'string' && raw ? raw.replace(/\/$/, '') : ''
}

export const env = {
  /** Base URL for the Identity Service (e.g. http://localhost:8000) */
  apiIdentityUrl: cleanUrl(identityBaseUrl),
  /** Base URL for the Phrasal Verbs Service (e.g. http://localhost:8001) */
  apiPhrasalVerbsUrl: cleanUrl(phrasalVerbsBaseUrl),
  /** Base URL for the Prepositions Service (e.g. http://localhost:8002) */
  apiPrepositionsUrl: cleanUrl(prepositionsBaseUrl),
  /** Base URL for the Chat Practice Service (e.g. http://localhost:8003) */
  apiChatPracticeUrl: cleanUrl(chatPracticeBaseUrl),
  /** Base URL for the German Nouns Service (e.g. http://localhost:8004) */
  apiGermanNounsUrl: cleanUrl(germanNounsBaseUrl),
  /** Base URL for the German Verbs Service (e.g. http://localhost:8005) */
  apiGermanVerbsUrl: cleanUrl(germanVerbsBaseUrl),
} as const
