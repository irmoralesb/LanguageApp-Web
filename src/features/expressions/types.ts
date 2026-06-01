export interface EnglishExpressionResponse {
  id: string
  text: string
  expression_type: string
  definition: string
  example_sentence: string | null
  register: string
  is_catalog: boolean
  created_by_user_id: string | null
  created_at: string | null
}

export interface EnglishExpressionSelectionResponse {
  id: string
  user_id: string
  english_expression_id: string
  added_at: string
}

export interface ExpressionMcPromptResponse {
  english_expression_id: string
  text: string
  definition: string
  sentence_with_blank: string
  options: string[]
  scenario_native: string
  prompt_token: string
}

export interface ExpressionExerciseEvaluationResponse {
  is_correct: boolean
  feedback: string
  correct_example: string | null
}

export interface UseInContextPromptResponse {
  english_expression_id: string
  text: string
  expression_type: string
  definition: string
  target_language_code: string
  scenario_native: string
  prompt_native: string
  expected_answer: string
}

export type ExpressionsExerciseMode = 'idiom-complete' | 'collocation-choice' | 'use-in-context'
