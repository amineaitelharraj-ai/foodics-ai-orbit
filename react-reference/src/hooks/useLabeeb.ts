import { useState, useEffect, useCallback, useRef } from 'react'
import { LabeebClient, InterruptEvent, Message, getLabeebApiUrl, ApprovalAckEvent, LabeebError } from '../services/labeeb-api'
import { sessionStorage, Session } from '../services/session-storage'

interface UseLabeebOptions {
  token: string
  idToken?: string
  baseUrl?: string
  onTokenExpired?: () => void
}

export interface ToolStatus {
  toolName: string
  message: string
}

export function useLabeeb({ token, idToken, baseUrl, onTokenExpired }: UseLabeebOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState<Set<string>>(new Set())
  const [pendingApproval, setPendingApproval] = useState<InterruptEvent | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)
  const [toolStatus, setToolStatus] = useState<ToolStatus | null>(null)
  const [complexQueryNotice, setComplexQueryNotice] = useState<string | null>(null)
  const [largeDataNotice, setLargeDataNotice] = useState<string | null>(null)
  const [queryClarification, setQueryClarification] = useState<{
    sessionId: string
    toolName: string
    message: string
    suggestedFilters: Array<{name: string; description: string}>
  } | null>(null)

  const clientRef = useRef<LabeebClient | null>(null)
  const streamingContentRef = useRef('')
  const savedMessageIds = useRef<Set<string>>(new Set())
  const pendingSessionRef = useRef<string | null>(null)
  const currentSessionRef = useRef<string | null>(null)

  const setSessionLoading = useCallback((sessionId: string | null, loading: boolean) => {
    if (!sessionId) return
    setLoadingSessions(prev => {
      const next = new Set(prev)
      if (loading) {
        next.add(sessionId)
      } else {
        next.delete(sessionId)
      }
      return next
    })
  }, [])

  useEffect(() => {
    streamingContentRef.current = streamingContent
  }, [streamingContent])

  useEffect(() => {
    if (idToken) {
      sessionStorage.setToken(idToken)
    }
  }, [idToken])

  useEffect(() => {
    const loadSessions = async () => {
      if (!idToken) return
      
      try {
        const savedSessions = await sessionStorage.getSessions()
        if (savedSessions && savedSessions.length > 0) {
          setSessions(savedSessions)
          
          const activeSessionId = sessionStorage.getActiveSessionId()
          if (activeSessionId) {
            const activeSession = savedSessions.find(s => s.id === activeSessionId)
            if (activeSession && activeSession.messages && activeSession.messages.length > 0) {
              setCurrentSessionId(activeSessionId)
              setMessages(activeSession.messages.map(m => ({
                ...m,
                timestamp: new Date(m.timestamp)
              })))
            }
          }
        }
      } catch (error) {
        console.error('Failed to load sessions:', error)
      }
    }
    
    loadSessions()
  }, [idToken])

  useEffect(() => {
    const apiUrl = baseUrl || getLabeebApiUrl()
    if (!token) return

    const client = new LabeebClient({
      baseUrl: apiUrl,
      token,
      onToken: (content) => {
        console.log('[TOKEN DEBUG] Received:', content?.substring?.(0, 100))
        // Update ref synchronously so onComplete can read latest value immediately
        // (useEffect-based sync is too slow when complete arrives right after token)
        streamingContentRef.current = streamingContentRef.current + content
        setStreamingContent(prev => prev + content)
      },
      onInterrupt: (interrupt) => {
        if (currentSessionRef.current && interrupt.session_id !== currentSessionRef.current && interrupt.session_id !== pendingSessionRef.current) {
          console.log('Ignoring interrupt from old session:', interrupt.session_id)
          return
        }
        
        const currentStreaming = streamingContentRef.current
        const newMessages: Message[] = []
        
        if (currentStreaming) {
          newMessages.push({
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: currentStreaming,
            timestamp: new Date()
          })
          setStreamingContent('')
          streamingContentRef.current = ''
        }
        
        const hitlMessage: Message = {
          id: `hitl-${interrupt.session_id}-${Date.now()}`,
          role: 'hitl',
          content: '',
          timestamp: new Date(),
          hitlData: {
            preview: interrupt.preview,
            session_id: interrupt.session_id,
            tool_name: interrupt.tool_name,
            status: 'pending'
          }
        }
        newMessages.push(hitlMessage)
        
        setMessages(prev => [...prev, ...newMessages])
        setPendingApproval(interrupt)
        setSessionLoading(interrupt.session_id, false)
      },
      onComplete: (sessionId) => {
        if (currentSessionRef.current && sessionId !== currentSessionRef.current && sessionId !== pendingSessionRef.current) {
          console.log('Ignoring complete from old session:', sessionId, 'current:', currentSessionRef.current)
          return
        }
        
        const currentStreaming = streamingContentRef.current
        if (currentStreaming) {
          const newMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: currentStreaming,
            timestamp: new Date()
          }
          setMessages(prev => {
            const updated = [...prev, newMessage]
            saveCurrentSession(sessionId, updated)

            const persistMessages = async () => {
              for (const msg of updated) {
                if (!savedMessageIds.current.has(msg.id)) {
                  let retries = 3
                  while (retries > 0) {
                    try {
                      await sessionStorage.addMessage(sessionId, msg)
                      savedMessageIds.current.add(msg.id)
                      break
                    } catch (err) {
                      retries--
                      if (retries === 0) {
                        console.error('Failed to persist message after retries:', err)
                        setError('Some messages may not have been saved. Please check your connection.')
                      } else {
                        await new Promise(r => setTimeout(r, 1000 * (3 - retries)))
                      }
                    }
                  }
                }
              }
            }
            persistMessages()

            return updated
          })
          setStreamingContent('')
        }
        setCurrentSessionId(sessionId)
        currentSessionRef.current = sessionId
        sessionStorage.setActiveSessionId(sessionId)
        setSessionLoading(sessionId, false)
        pendingSessionRef.current = null
        setComplexQueryNotice(null)
        setLargeDataNotice(null)
      },
      onApprovalAck: (ack: ApprovalAckEvent) => {
        if (ack.processed) {
          setPendingApproval(null)
          setCurrentSessionId(ack.session_id)
          sessionStorage.setActiveSessionId(ack.session_id)
          
          setMessages(prev => {
            saveCurrentSession(ack.session_id, prev)
            return prev
          })
        }
      },
      onToolStart: (toolName, message) => {
        setToolStatus({ toolName, message })
      },
      onToolEnd: () => {
        setToolStatus(null)
        setLargeDataNotice(null)
      },
      onComplexQueryNotice: (message) => {
        setComplexQueryNotice(message)
      },
      onLargeDataNotice: (message) => {
        setLargeDataNotice(message)
      },
      onQueryClarification: (data) => {
        setQueryClarification(data)
        setSessionLoading(data.sessionId, false)
      },
      onClarificationAck: (sessionId) => {
        setSessionLoading(sessionId, true)
      },
      onRefinementApplied: (_sessionId, refinement, _toolName) => {
        setMessages(prev => [
          ...prev,
          {
            id: `refinement-${Date.now()}`,
            role: 'user',
            content: refinement,
            timestamp: new Date()
          }
        ])
      },
      onError: (err) => {
        console.error('Labeeb error:', err)
        const labeebError = err as LabeebError
        
        if (labeebError.code === 4002 || labeebError.code === 4004) {
          onTokenExpired?.()
          return
        }
        
        if (labeebError.pendingTool) {
          setError(`Please approve or reject the pending "${labeebError.pendingTool}" action before sending new messages.`)
        } else {
          setError(err.message)
        }
        if (pendingSessionRef.current) {
          setSessionLoading(pendingSessionRef.current, false)
          pendingSessionRef.current = null
        }
        setToolStatus(null)
      },
      onConnectionChange: (connected) => {
        setIsConnected(connected)
      }
    })

    clientRef.current = client
    
    client.connect()
      .then(() => setIsConnected(true))
      .catch(err => {
        console.error('Failed to connect:', err)
        setIsConnected(false)
      })

    return () => client.disconnect()
  }, [token, baseUrl])

  const saveCurrentSession = useCallback(async (sessionId: string, msgs: Message[]) => {
    const session: Session = {
      id: sessionId,
      messages: msgs,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: msgs.find(m => m.role === 'user')?.content.slice(0, 50) || 'New conversation'
    }
    await sessionStorage.saveSession(session)
    const updatedSessions = await sessionStorage.getSessions()
    setSessions(updatedSessions)
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => {
      const currentStreaming = streamingContentRef.current
      let updatedMessages = [...prev]
      
      if (currentStreaming && currentStreaming.trim()) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now() - 1}`,
          role: 'assistant',
          content: currentStreaming,
          timestamp: new Date()
        }
        updatedMessages = [...updatedMessages, assistantMessage]
        console.log('Finalized pending streaming content before new message')
      }
      
      console.log('sendMessage - prev messages:', prev.length, 'new total:', updatedMessages.length + 1)
      return [...updatedMessages, userMessage]
    })
    
    setStreamingContent('')
    
    const sessionId = currentSessionId || `pending-${Date.now()}`
    pendingSessionRef.current = sessionId
    setSessionLoading(sessionId, true)
    
    try {
      clientRef.current.sendMessage(content)
    } catch (error) {
      console.error('Failed to send message:', error)
      setSessionLoading(sessionId, false)
      pendingSessionRef.current = null
    }
  }, [currentSessionId, setSessionLoading])

  const handleApproval = useCallback((decision: 'approve' | 'reject', reason?: string, sessionId?: string) => {
    if (!clientRef.current) return
    
    const targetSessionId = sessionId || pendingApproval?.session_id
    if (!targetSessionId) return

    setMessages(prev => prev.map(msg => {
      if (msg.role === 'hitl' && msg.hitlData?.session_id === targetSessionId && msg.hitlData.status === 'pending') {
        return {
          ...msg,
          hitlData: {
            ...msg.hitlData,
            status: decision === 'approve' ? 'approved' : 'rejected'
          }
        }
      }
      return msg
    }))
    
    pendingSessionRef.current = targetSessionId
    setSessionLoading(targetSessionId, true)
    
    try {
      clientRef.current.approve(targetSessionId, decision, reason)
    } catch (error) {
      console.error('Failed to send approval:', error)
      setSessionLoading(targetSessionId, false)
      pendingSessionRef.current = null
    }
    
    setPendingApproval(null)
  }, [pendingApproval, setSessionLoading])
  
  const updateHitlImageUrl = useCallback((sessionId: string, imageUrl: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.role === 'hitl' && msg.hitlData?.session_id === sessionId) {
        return {
          ...msg,
          hitlData: {
            ...msg.hitlData,
            generatedImageUrl: imageUrl
          }
        }
      }
      return msg
    }))
  }, [])

  const startNewSession = useCallback(() => {
    setMessages([])
    setCurrentSessionId(null)
    currentSessionRef.current = null
    setStreamingContent('')
    streamingContentRef.current = ''
    setPendingApproval(null)
    setLoadingSessions(new Set())
    setToolStatus(null)
    pendingSessionRef.current = null
    savedMessageIds.current.clear()
    if (clientRef.current) {
      clientRef.current.setSessionId(null)
    }
    sessionStorage.setActiveSessionId('')
  }, [])

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const session = await sessionStorage.getSession(sessionId)
      if (session && session.messages && session.messages.length > 0) {
        savedMessageIds.current.clear()
        session.messages.forEach(m => savedMessageIds.current.add(m.id))
        
        setLoadingSessions(new Set())
        setToolStatus(null)
        setStreamingContent('')
        streamingContentRef.current = ''
        pendingSessionRef.current = null
        
        setMessages(session.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })))
        setCurrentSessionId(sessionId)
        currentSessionRef.current = sessionId
        if (clientRef.current) {
          clientRef.current.setSessionId(sessionId)
        }
        sessionStorage.setActiveSessionId(sessionId)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }, [])

  const deleteSession = useCallback(async (sessionId: string) => {
    await sessionStorage.deleteSession(sessionId)
    const updatedSessions = await sessionStorage.getSessions()
    setSessions(updatedSessions)
    if (currentSessionId === sessionId) {
      startNewSession()
    }
  }, [currentSessionId, startNewSession])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearComplexQueryNotice = useCallback(() => {
    setComplexQueryNotice(null)
  }, [])

  const handleClarificationProceed = useCallback(() => {
    if (!queryClarification || !clientRef.current) return
    clientRef.current.sendClarificationResponse(queryClarification.sessionId, 'proceed')
    setQueryClarification(null)
    setSessionLoading(queryClarification.sessionId, true)
  }, [queryClarification])

  const handleClarificationRefine = useCallback((refinement: string) => {
    if (!queryClarification || !clientRef.current) return
    clientRef.current.sendClarificationResponse(queryClarification.sessionId, 'refine', refinement)
    setQueryClarification(null)
    setSessionLoading(queryClarification.sessionId, true)
  }, [queryClarification])

  const handleClarificationCancel = useCallback(() => {
    setQueryClarification(null)
  }, [])


  const isLoading = currentSessionId 
    ? loadingSessions.has(currentSessionId) 
    : (pendingSessionRef.current ? loadingSessions.has(pendingSessionRef.current) : loadingSessions.size > 0)

  return {
    messages,
    isConnected,
    isLoading,
    pendingApproval,
    streamingContent,
    currentSessionId,
    sessions,
    error,
    updateHitlImageUrl,
    toolStatus,
    complexQueryNotice,
    largeDataNotice,
    queryClarification,
    sendMessage,
    handleApproval,
    handleClarificationProceed,
    handleClarificationRefine,
    handleClarificationCancel,
    startNewSession,
    loadSession,
    deleteSession,
    clearError,
    clearComplexQueryNotice
  }
}
