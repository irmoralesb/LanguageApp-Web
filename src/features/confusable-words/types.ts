export interface ConfusableWordExercisePromptResponse {
  option_a: string
  option_b: string
  target_language_code: string
  scenario_native: string
  sentence_with_blank: string
  prompt_token: string
}

export interface ConfusableWordEvaluationResponse {
  is_correct: boolean
  feedback: string
  correct_word: string | null
  sentence_complete: string | null
}

export interface ConfusableWordPairStatsResponse {
  option_a: string
  option_b: string
  correct_count: number
  incorrect_count: number
}
