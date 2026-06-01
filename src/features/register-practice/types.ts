export type RegisterOption = 'formal' | 'neutral' | 'casual'
export type SlangLevel = 'light' | 'moderate' | 'heavy'

export interface RegisterSwitchExercisePromptResponse {
  target_language_code: string
  scenario_native: string
  source_sentence: string
  source_register: string
  target_register: string
  slang_level: string | null
  prompt_token: string
}

export interface RegisterSwitchEvaluationResponse {
  is_correct: boolean
  feedback: string
  model_answer: string | null
}
