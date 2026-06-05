export type ModuleLanguage = 'en' | 'de'

export interface PracticeModuleConfig {
  key: string
  label: string
  language: ModuleLanguage
  path: string
  serviceName: string
}

export const PRACTICE_MODULES: PracticeModuleConfig[] = [
  { key: 'phrasal-verbs', label: 'Phrasal Verbs', language: 'en', path: '/phrasal-verbs', serviceName: 'english-service' },
  { key: 'prepositions', label: 'Prepositions', language: 'en', path: '/prepositions', serviceName: 'english-service' },
  { key: 'chat-practice', label: 'Chat Practice', language: 'en', path: '/chat-practice', serviceName: 'english-service' },
  { key: 'sentence-skills', label: 'Sentence Skills', language: 'en', path: '/sentence-skills', serviceName: 'english-service' },
  { key: 'expressions', label: 'Expressions', language: 'en', path: '/expressions', serviceName: 'english-service' },
  { key: 'german-nouns', label: 'German Nouns', language: 'de', path: '/german/nouns', serviceName: 'deutsch-service' },
  { key: 'german-verbs', label: 'German Verbs', language: 'de', path: '/german/verbs', serviceName: 'deutsch-service' },
]

export const LANGUAGE_LABELS: Record<ModuleLanguage, string> = {
  en: 'English',
  de: 'German',
}
