export interface CorrectionItem {
  original: string
  issue: string
  suggestion: string
}

export interface RecommendationItem {
  original: string
  better_expression: string
  reason: string
}

export interface MessageFeedback {
  id: string
  message_id: string
  corrections: CorrectionItem[]
  recommendations: RecommendationItem[]
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  feedback?: MessageFeedback | null
}

export interface ChatSession {
  id: string
  user_id: string
  topic: string | null
  created_at: string
  updated_at: string
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[]
}

export interface SendMessageResponse {
  assistant_message: ChatMessage
  feedback: MessageFeedback
}
