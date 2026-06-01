export interface LanguageResponse {
  id: string
  code: string
  name: string
  is_target_language: boolean
  is_native_language: boolean
}

export interface UserProfileResponse {
  id: string
  user_id: string
  native_language_id: string
  learning_language_ids: string[]
  created_at: string
  updated_at: string
}

export interface GermanNounResponse {
  id: string
  singular: string
  plural: string | null
  article_singular: string
  article_plural: string | null
  definition: string
  is_catalog: boolean
}

export interface GermanNounSelectionResponse {
  id: string
  user_id: string
  german_noun_id: string
  added_at: string
}

export type GermanNounGenderArticle = 'der' | 'die' | 'das'

export interface NounGenderExerciseItem {
  german_noun_id: string
  singular: string
  definition: string
  incorrect_attempts: number
  correct_attempts: number
}

export interface NounGenderExerciseGenerateResponse {
  target_score: number
  nouns: NounGenderExerciseItem[]
}

export interface NounGenderExerciseEvaluateResponse {
  is_correct: boolean
  correct_article: GermanNounGenderArticle
  feedback: string
}

export type GermanGrammaticalCase = 'nominativ' | 'akkusativ' | 'dativ' | 'genitiv'

export interface NounCaseExerciseGenerateResponse {
  german_noun_id: string
  singular: string
  definition: string
  grammatical_case: GermanGrammaticalCase
  case_label: string
  sentence_with_blank: string
  scenario_native: string
  article_options: string[]
  incorrect_attempts: number
  correct_attempts: number
}

export interface NounCaseExerciseEvaluateResponse {
  is_correct: boolean
  correct_article: string
  feedback: string
  correct_phrase: string
}

export interface ExerciseGenerateResponse {
  german_noun_id: string
  target_language_code: string
  exercise_mode: string
  scenario_native: string
  prompt_native: string
  expected_answer: string
}

export interface ExerciseEvaluateResponse {
  is_correct: boolean
  feedback: string
  correct_example: string | null
}
