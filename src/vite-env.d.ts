/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_IDENTITY_URL: string
  readonly VITE_API_PHRASAL_VERBS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
