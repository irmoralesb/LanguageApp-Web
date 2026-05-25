export type SketchLanguage = {
  id: string
  name: string
  flag: string
  progress: number
  moduleCount: number
}

export type SketchModule = {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  completed: number
  total: number
}

export type SketchPhrasalVerb = {
  id: string
  text: string
  definition: string
  example: string
  strength: 'New' | 'Learning' | 'Strong'
}

export type SketchPracticeTerm = {
  id: string
  term: string
  type: 'single' | 'pair' | 'multi'
  definition: string
  examples: string[]
}

export type SketchGermanNoun = {
  id: string
  noun: string
  article: 'der' | 'die' | 'das'
  plural: string
  meaning: string
  caseFocus: 'Nominative' | 'Accusative' | 'Dative'
}

export type SketchGermanVerb = {
  id: string
  infinitive: string
  meaning: string
  tense: 'Present' | 'Past' | 'Future'
  weakOrStrong: 'Weak' | 'Strong' | 'Mixed'
  sample: string
}

export const MOCK_LANGUAGES: SketchLanguage[] = [
  { id: 'en', name: 'English', flag: '🇬🇧', progress: 42, moduleCount: 4 },
  { id: 'de', name: 'Deutsch', flag: '🇩🇪', progress: 11, moduleCount: 2 },
]

export const MOCK_MODULES: Record<string, SketchModule[]> = {
  en: [
    {
      id: 'pv',
      title: 'Phrasal Verbs',
      description: 'Master common verb + particle combinations.',
      duration: '15 min',
      difficulty: 'Intermediate',
      completed: 12,
      total: 40,
    },
    {
      id: 'prep',
      title: 'Prepositions',
      description: 'Practice in, on, at, and trickier cases.',
      duration: '12 min',
      difficulty: 'Beginner',
      completed: 5,
      total: 30,
    },
    {
      id: 'chat',
      title: 'Chat Practice',
      description: 'Conversational drills with instant feedback.',
      duration: '20 min',
      difficulty: 'Advanced',
      completed: 2,
      total: 15,
    },
  ],
  de: [],
}

export const MOCK_EXERCISE = {
  prompt: 'Choose the correct phrasal verb:',
  sentence: 'She needs to ___ her old habits.',
  options: ['give up', 'give in', 'give away', 'give off'],
  correctIndex: 0,
}

export const MOCK_PHRASAL_VERBS: SketchPhrasalVerb[] = [
  {
    id: 'give-up',
    text: 'give up',
    definition: 'Stop doing something or stop trying.',
    example: 'She gave up eating sugar during the week.',
    strength: 'Learning',
  },
  {
    id: 'look-after',
    text: 'look after',
    definition: 'Take care of someone or something.',
    example: 'He looks after his little brother after school.',
    strength: 'Strong',
  },
  {
    id: 'run-into',
    text: 'run into',
    definition: 'Meet someone unexpectedly.',
    example: 'I ran into an old friend downtown.',
    strength: 'New',
  },
  {
    id: 'turn-down',
    text: 'turn down',
    definition: 'Reject an offer or reduce volume.',
    example: 'She turned down the job offer.',
    strength: 'Learning',
  },
  {
    id: 'bring-up',
    text: 'bring up',
    definition: 'Mention a topic or raise a child.',
    example: 'Please do not bring up that topic today.',
    strength: 'New',
  },
  {
    id: 'figure-out',
    text: 'figure out',
    definition: 'Understand or solve something.',
    example: 'We need to figure out the best answer.',
    strength: 'Strong',
  },
]

export const MOCK_PHRASAL_EXERCISE = {
  scenario: 'You are explaining that a friend stopped a bad habit.',
  nativeSentence: 'Ella dejo de fumar el ano pasado.',
  targetSentence: 'She gave up smoking last year.',
  hint: 'Think of a phrasal verb that means to stop doing something.',
  feedback:
    'Good sentence structure. Check that the phrasal verb is in the past tense and keep the object after it.',
  correctExample: 'She gave up smoking last year.',
}

export const MOCK_PREPOSITION_TERMS: SketchPracticeTerm[] = [
  {
    id: 'in',
    term: 'in',
    type: 'single',
    definition: 'Inside a place or within a period of time.',
    examples: ['in the kitchen', 'in five minutes'],
  },
  {
    id: 'on',
    term: 'on',
    type: 'single',
    definition: 'Touching a surface or scheduled for a day/date.',
    examples: ['on the table', 'on Monday'],
  },
  {
    id: 'at',
    term: 'at',
    type: 'single',
    definition: 'A precise place or time.',
    examples: ['at the door', 'at 7:00'],
  },
  {
    id: 'to-for',
    term: 'to / for',
    type: 'pair',
    definition: 'Contrasting direction, recipient, purpose, and benefit.',
    examples: ['go to school', 'a gift for you'],
  },
]

export const MOCK_GERMAN_NOUNS: SketchGermanNoun[] = [
  {
    id: 'tisch',
    noun: 'Tisch',
    article: 'der',
    plural: 'Tische',
    meaning: 'table',
    caseFocus: 'Nominative',
  },
  {
    id: 'blume',
    noun: 'Blume',
    article: 'die',
    plural: 'Blumen',
    meaning: 'flower',
    caseFocus: 'Accusative',
  },
  {
    id: 'buch',
    noun: 'Buch',
    article: 'das',
    plural: 'Bücher',
    meaning: 'book',
    caseFocus: 'Dative',
  },
]

export const MOCK_GERMAN_VERBS: SketchGermanVerb[] = [
  {
    id: 'gehen',
    infinitive: 'gehen',
    meaning: 'to go',
    tense: 'Present',
    weakOrStrong: 'Strong',
    sample: 'ich gehe',
  },
  {
    id: 'machen',
    infinitive: 'machen',
    meaning: 'to make / do',
    tense: 'Present',
    weakOrStrong: 'Weak',
    sample: 'du machst',
  },
  {
    id: 'sein',
    infinitive: 'sein',
    meaning: 'to be',
    tense: 'Past',
    weakOrStrong: 'Mixed',
    sample: 'er war',
  },
]

export const MOCK_ADMIN_USERS = [
  { name: 'Ana Rivera', email: 'ana@example.com', role: 'User', languages: 'EN, ES' },
  { name: 'James Cole', email: 'james@example.com', role: 'Admin', languages: 'All' },
  { name: 'Mia Chen', email: 'mia@example.com', role: 'User', languages: 'EN' },
]
