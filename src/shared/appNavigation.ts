export type LanguageId = 'en' | 'de'

export type AppLanguage = {
  id: LanguageId
  name: string
  flag: string
}

export const APP_LANGUAGES: AppLanguage[] = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
]

export type ModuleAccess =
  | 'english'
  | 'germanNouns'
  | 'germanVerbs'

export type AppModule = {
  id: string
  title: string
  description: string
  path: string
  languageId: LanguageId
  access?: ModuleAccess
}

export const APP_MODULES: AppModule[] = [
  {
    id: 'pv',
    title: 'Phrasal Verbs',
    description: 'Master common verb + particle combinations.',
    path: '/phrasal-verbs',
    languageId: 'en',
    access: 'english',
  },
  {
    id: 'prep-single',
    title: 'Prepositions',
    description: 'Practice one preposition at a time.',
    path: '/prepositions',
    languageId: 'en',
    access: 'english',
  },
  {
    id: 'prep-multiple',
    title: 'Multiple Prepositions',
    description: 'Choose the correct preposition in context.',
    path: '/prepositions/multiple',
    languageId: 'en',
    access: 'english',
  },
  {
    id: 'prep-choice',
    title: 'Similar Prepositions',
    description: 'Pick between easily confused prepositions such as in vs into.',
    path: '/prepositions/choice',
    languageId: 'en',
    access: 'english',
  },
  {
    id: 'chat',
    title: 'Chat Practice',
    description: 'Conversational drills with instant feedback.',
    path: '/chat-practice',
    languageId: 'en',
    access: 'english',
  },
  {
    id: 'confusable-words',
    title: 'Confusable Words',
    description: 'Pick the correct word when two similar words are easily confused.',
    path: '/confusable-words',
    languageId: 'en',
    access: 'english',
  },
  {
    id: 'natural-rewrite',
    title: 'Natural Rewrite',
    description: 'Rewrite stiff English into a natural, conversational sentence.',
    path: '/natural-rewrite',
    languageId: 'en',
    access: 'english',
  },
  {
    id: 'register-practice',
    title: 'Register Practice',
    description: 'Switch sentences between formal, neutral, and casual registers.',
    path: '/register-practice',
    languageId: 'en',
    access: 'english',
  },
  {
    id: 'expressions',
    title: 'Expressions',
    description: 'Practice idioms, collocations, and using expressions in context.',
    path: '/expressions',
    languageId: 'en',
    access: 'english',
  },
  {
    id: 'german-nouns',
    title: 'German Nouns',
    description: 'Practice articles, singular and plural forms.',
    path: '/german/nouns',
    languageId: 'de',
    access: 'germanNouns',
  },
  {
    id: 'german-verbs',
    title: 'German Verbs',
    description: 'Practice verb conjugations across common tenses.',
    path: '/german/verbs',
    languageId: 'de',
    access: 'germanVerbs',
  },
]

export type ModuleAccessFlags = {
  hasEnglishAccess: boolean
  hasGermanNounsAccess: boolean
  hasGermanVerbsAccess: boolean
}

function hasModuleAccess(module: AppModule, access: ModuleAccessFlags): boolean {
  if (!module.access) return true
  if (module.access === 'english') return access.hasEnglishAccess
  if (module.access === 'germanNouns') return access.hasGermanNounsAccess
  if (module.access === 'germanVerbs') return access.hasGermanVerbsAccess
  return false
}

export function getModulesForLanguage(
  languageId: LanguageId,
  access: ModuleAccessFlags,
): AppModule[] {
  return APP_MODULES.filter(
    (module) => module.languageId === languageId && hasModuleAccess(module, access),
  )
}

export function findModuleByPath(pathname: string): AppModule | undefined {
  return [...APP_MODULES]
    .sort((a, b) => b.path.length - a.path.length)
    .find((module) => pathname === module.path || pathname.startsWith(`${module.path}/`))
}

export function parseLanguageParam(value: string | null): LanguageId | null {
  if (value === 'en' || value === 'de') return value
  return null
}
