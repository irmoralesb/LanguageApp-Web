/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_IDENTITY_URL: string
  readonly VITE_API_PHRASAL_VERBS_URL: string
  readonly VITE_API_PREPOSITIONS_URL: string
  readonly VITE_API_CHAT_PRACTICE_URL: string
  readonly VITE_API_GERMAN_NOUNS_URL: string
  readonly VITE_API_GERMAN_VERBS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
