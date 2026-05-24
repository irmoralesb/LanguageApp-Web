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

export interface GermanVerbConjugationResponse {
  id: string
  tense: string
  person: string
  conjugated_form: string
}

export interface GermanVerbResponse {
  id: string
  infinitive: string
  definition: string
  is_catalog: boolean
  conjugations: GermanVerbConjugationResponse[]
}

export interface GermanVerbSelectionResponse {
  id: string
  user_id: string
  german_verb_id: string
  added_at: string
}

export interface ExerciseGenerateResponse {
  german_verb_id: string
  target_language_code: string
  tense: string
  person: string
  scenario_native: string
  prompt_native: string
  expected_answer: string
}

export interface ExerciseEvaluateResponse {
  is_correct: boolean
  feedback: string
  correct_example: string | null
}
