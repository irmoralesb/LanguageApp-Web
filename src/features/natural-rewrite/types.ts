export interface NaturalRewriteExercisePromptResponse {
  target_language_code: string
  scenario_native: string
  stiff_sentence: string
  context_note: string
  prompt_token: string
}

export interface NaturalRewriteEvaluationResponse {
  is_correct: boolean
  feedback: string
  model_answer: string | null
}
