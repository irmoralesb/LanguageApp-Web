export interface PracticeTermResponse {
  id: string
  term: string
  term_type: string
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

export interface PracticeTermSelectionResponse {
  id: string
  user_id: string
  practice_term_id: string
  added_at: string
}

export interface ExercisePromptResponse {
  practice_term_id: string
  practice_term_text: string
  term_type: string
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

export interface MultiplePrepositionsExercisePromptResponse {
  practice_term_ids: string[]
  practice_term_texts: string[]
  target_language_code: string
  sentence_native: string
  prompt_token: string
}

export interface MultiplePrepositionsAnswerRequest {
  prompt_token: string
  user_answer: string
  attempt_number: 1 | 2
}

export interface PrepositionFeedbackItem {
  preposition: string
  used_correctly: boolean
  explanation: string
}

export interface MultiplePrepositionsEvaluationResponse {
  is_correct: boolean
  feedback: string
  preposition_feedback: PrepositionFeedbackItem[]
  minor_issues: string[]
  attempt_number: number
  correct_sentence_target: string | null
}
