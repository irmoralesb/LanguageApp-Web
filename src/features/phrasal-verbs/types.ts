export interface PhrasalVerbResponse {
  id: string
  verb: string
  particle: string
  definition: string
  example_sentence: string | null
  is_catalog: boolean
  created_by_user_id: string | null
  created_at: string
}

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

export interface PhrasalVerbSelectionResponse {
  id: string
  user_id: string
  phrasal_verb_id: string
  added_at: string
}

export interface ExercisePromptResponse {
  phrasal_verb_id: string
  phrasal_verb_text: string
  target_language_code: string
  scenario_native: string
  sentence_native: string
  sentence_target: string
}

export interface ExerciseEvaluationResponse {
  is_correct: boolean
  feedback: string
  correct_example: string | null
}
