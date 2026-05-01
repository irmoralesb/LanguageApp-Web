import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, chatPracticeUrl } from '@/api/client'
import { chatPracticeEndpoints } from '@/api/endpoints'
import type {
  ChatMessage,
  ChatSession,
  ChatSessionDetail,
  MessageFeedback,
  SendMessageResponse,
} from './types'
import { SessionList } from './components/SessionList'
import { ChatWindow } from './components/ChatWindow'
import { FeedbackPanel } from './components/FeedbackPanel'

type View = 'loading' | 'ready' | 'error'

export function ChatPracticePage() {
  const { token } = useAuth()

  const [view, setView] = useState<View>('loading')
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSessionDetail | null>(null)
  const [latestFeedback, setLatestFeedback] = useState<MessageFeedback | null>(null)
  const [sending, setSending] = useState(false)
  const [creatingSession, setCreatingSession] = useState(false)

  // Load session list on mount
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        chatPracticeUrl(chatPracticeEndpoints.sessions.list),
        { method: 'GET' },
        token,
      )
      if (!res.ok) throw new Error('Failed to load sessions')
      const data: ChatSession[] = await res.json()
      setSessions(data)
      setView('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setView('error')
    }
  }, [token])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Select a session and load its messages
  const handleSelectSession = useCallback(async (session: ChatSession) => {
    setLatestFeedback(null)
    try {
      const res = await fetchWithAuth(
        chatPracticeUrl(chatPracticeEndpoints.sessions.get(session.id)),
        { method: 'GET' },
        token,
      )
      if (!res.ok) throw new Error('Failed to load session')
      const data: ChatSessionDetail = await res.json()
      setActiveSession(data)

      // Restore last feedback if available
      const lastUserMsg = [...data.messages].reverse().find((m) => m.role === 'user')
      if (lastUserMsg?.feedback) {
        setLatestFeedback(lastUserMsg.feedback)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }, [token])

  // Create a new session
  const handleNewSession = useCallback(async () => {
    const topic = window.prompt('Topic (optional, press Enter to skip):') ?? undefined
    setCreatingSession(true)
    try {
      const res = await fetchWithAuth(
        chatPracticeUrl(chatPracticeEndpoints.sessions.create),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: topic || null }),
        },
        token,
      )
      if (!res.ok) throw new Error('Failed to create session')
      const created: ChatSession = await res.json()
      setSessions((prev) => [created, ...prev])
      setActiveSession({ ...created, messages: [] })
      setLatestFeedback(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setCreatingSession(false)
    }
  }, [token])

  // Send a message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeSession) return
      setSending(true)

      // Optimistically add the user message
      const optimisticUserMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        session_id: activeSession.id,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }
      setActiveSession((prev) =>
        prev ? { ...prev, messages: [...prev.messages, optimisticUserMsg] } : prev,
      )

      try {
        const res = await fetchWithAuth(
          chatPracticeUrl(chatPracticeEndpoints.sessions.sendMessage(activeSession.id)),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          },
          token,
        )
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.detail ?? 'Failed to send message')
        }
        const data: SendMessageResponse = await res.json()

        setActiveSession((prev) => {
          if (!prev) return prev
          // Replace optimistic message + append assistant reply
          const withoutOptimistic = prev.messages.filter((m) => m.id !== optimisticUserMsg.id)
          return {
            ...prev,
            messages: [
              ...withoutOptimistic,
              { ...optimisticUserMsg, id: data.feedback.message_id, feedback: data.feedback },
              data.assistant_message,
            ],
          }
        })

        setLatestFeedback(data.feedback)

        // Refresh session list to update updated_at ordering
        loadSessions()
      } catch (e) {
        // Remove optimistic message on error
        setActiveSession((prev) =>
          prev
            ? { ...prev, messages: prev.messages.filter((m) => m.id !== optimisticUserMsg.id) }
            : prev,
        )
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setSending(false)
      }
    },
    [activeSession, token, loadSessions],
  )

  if (view === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Loading sessions…</p>
      </div>
    )
  }

  if (view === 'error') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center">
          <p className="font-semibold text-red-700">Something went wrong</p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => { setView('loading'); setError(null); loadSessions() }}
            className="mt-3 rounded bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <SessionList
        sessions={sessions}
        activeSessionId={activeSession?.id ?? null}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
        loading={creatingSession}
      />

      {activeSession ? (
        <>
          <ChatWindow
            messages={activeSession.messages}
            sending={sending}
            onSend={handleSendMessage}
          />
          <FeedbackPanel feedback={latestFeedback} />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-slate-50">
          <div className="text-center">
            <p className="text-slate-500">Select a session or start a new one.</p>
            <button
              type="button"
              onClick={handleNewSession}
              disabled={creatingSession}
              className="mt-4 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              + New session
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
