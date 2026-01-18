export interface Message {
  id: string
  role: 'user' | 'assistant' | 'hitl'
  content: string
  timestamp: Date
  isStreaming?: boolean
  hitlData?: {
    preview: unknown
    session_id: string
    tool_name: string
    status: 'pending' | 'approved' | 'rejected'
    generatedImageUrl?: string
  }
}

export interface InterruptEvent {
  session_id: string
  action: string
  tool_name: string
  preview: unknown
  arguments: Record<string, unknown>
}

export interface ApprovalAckEvent {
  session_id: string
  processed: boolean
}

export interface LabeebClientOptions {
  baseUrl: string
  token: string
  onToken?: (content: string) => void
  onInterrupt?: (interrupt: InterruptEvent) => void
  onComplete?: (sessionId: string) => void
  onApprovalAck?: (ack: ApprovalAckEvent) => void
  onToolStart?: (toolName: string, message: string) => void
  onToolEnd?: (toolName: string) => void
  onComplexQueryNotice?: (message: string) => void
  onLargeDataNotice?: (message: string) => void
  onQueryClarification?: (data: { sessionId: string; toolName: string; message: string; suggestedFilters: Array<{name: string; description: string}> }) => void
  onClarificationAck?: (sessionId: string, action: 'proceed' | 'refine') => void
  onRefinementApplied?: (sessionId: string, refinement: string, toolName: string) => void
  onError?: (error: Error) => void
  onConnectionChange?: (connected: boolean) => void
}

export interface LabeebError extends Error {
  pendingTool?: string
  code?: number
}

type WebSocketMessage = 
  | { type: 'token'; content: string }
  | { type: 'interrupt'; session_id: string; action: string; tool_name: string; preview: string; arguments: Record<string, unknown> }
  | { type: 'complete'; session_id: string }
  | { type: 'approval_ack'; session_id: string; decision: string }
  | { type: 'tool_start'; tool_name: string; message: string }
  | { type: 'tool_end'; tool_name: string }
  | { type: 'complex_query_notice'; message: string }
  | { type: 'large_data_notice'; message: string }
  | { type: 'query_clarification'; session_id: string; tool_name: string; message: string; suggested_filters: Array<{name: string; description: string}>; arguments: Record<string, unknown> }
  | { type: 'clarification_ack'; session_id: string; action: 'proceed' | 'refine' }
  | { type: 'refinement_applied'; session_id: string; refinement: string; tool_name: string }
  | { type: 'error'; message: string; pending_tool?: string }
  | { type: 'pong' }

const CLOSE_CODE_MESSAGES: Record<number, string> = {
  4001: 'Missing authentication token',
  4002: 'Token expired - please log in again',
  4003: 'Invalid token audience',
  4004: 'Invalid token - please log in again',
  4005: 'Failed to connect to AgentCore'
}

export class LabeebClient {
  private ws: WebSocket | null = null
  private sessionId: string | null = null
  private options: LabeebClientOptions
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private pingInterval: ReturnType<typeof setInterval> | null = null

  constructor(options: LabeebClientOptions) {
    this.options = options
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      let wsUrl = this.options.baseUrl
      
      if (wsUrl.startsWith('http://')) {
        wsUrl = wsUrl.replace('http://', 'ws://')
      } else if (wsUrl.startsWith('https://')) {
        wsUrl = wsUrl.replace('https://', 'wss://')
      } else if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        wsUrl = 'ws://' + wsUrl
      }
      
      wsUrl = wsUrl.replace(/\/+$/, '')
      
      try {
        const urlWithAuth = this.options.token
          ? `${wsUrl}?token=${encodeURIComponent(this.options.token)}`
          : wsUrl
        console.log('Connecting to WebSocket proxy:', urlWithAuth.replace(/token=.*/, 'token=[REDACTED]'))
        this.ws = new WebSocket(urlWithAuth)
      } catch (error) {
        reject(new Error('Failed to create WebSocket connection'))
        return
      }

      this.ws.onopen = () => {
        console.log('WebSocket connected to Labeeb proxy')
        this.reconnectAttempts = 0
        this.options.onConnectionChange?.(true)
        this.startPingInterval()
        resolve()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage
          this.handleMessage(data)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        this.options.onError?.(new Error('WebSocket error'))
        this.options.onConnectionChange?.(false)
        reject(new Error('WebSocket connection error'))
      }

      this.ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} - ${event.reason}`)
        this.options.onConnectionChange?.(false)
        this.stopPingInterval()
        
        const errorMessage = CLOSE_CODE_MESSAGES[event.code]
        if (errorMessage) {
          const error: LabeebError = new Error(errorMessage) as LabeebError
          error.code = event.code
          this.options.onError?.(error)
          
          if (event.code === 4002 || event.code === 4004) {
            return
          }
        }
        
        this.attemptReconnect()
      }
    })
  }

  private handleMessage(data: WebSocketMessage): void {
    console.log('[WS DEBUG] Received:', data.type, JSON.stringify(data).substring(0, 200))
    
    switch (data.type) {
      case 'token':
        console.log('[WS DEBUG] Token content type:', typeof data.content)
        
        let text: string
        if (typeof data.content === 'string') {
          text = data.content
        } else if (data.content && typeof data.content === 'object') {
          text = (data.content as any)?.[0]?.text || JSON.stringify(data.content)
        } else {
          text = String(data.content || '')
        }
        
        console.log('[WS DEBUG] Extracted text:', text?.substring?.(0, 100))
        
        if (text) {
          this.options.onToken?.(text)
        }
        break
      case 'interrupt':
        this.options.onInterrupt?.({
          session_id: data.session_id,
          action: data.action,
          tool_name: data.tool_name,
          preview: data.preview,
          arguments: data.arguments
        })
        break
      case 'complete':
        if (data.session_id) {
          this.sessionId = data.session_id
        }
        this.options.onComplete?.(data.session_id || this.sessionId || '')
        break
      case 'approval_ack':
        if (data.session_id) {
          this.sessionId = data.session_id
        }
        this.options.onApprovalAck?.({
          session_id: data.session_id,
          processed: true
        })
        break
      case 'tool_start':
        this.options.onToolStart?.(data.tool_name, data.message)
        break
      case 'tool_end':
        this.options.onToolEnd?.(data.tool_name)
        break
      case 'complex_query_notice':
        console.log('[WS] Complex query detected:', data.message)
        this.options.onComplexQueryNotice?.(data.message)
        break
      case 'large_data_notice':
        console.log('[WS] Large data fetch:', data.message)
        this.options.onLargeDataNotice?.(data.message)
        break
      case 'query_clarification':
        console.log('[WS] Query clarification:', data)
        this.options.onQueryClarification?.({
          sessionId: data.session_id,
          toolName: data.tool_name,
          message: data.message,
          suggestedFilters: data.suggested_filters || []
        })
        break
      case 'clarification_ack':
        console.log('[WS] Clarification acknowledged:', data.action)
        this.options.onClarificationAck?.(data.session_id, data.action)
        break
      case 'refinement_applied':
        console.log('[WS] Refinement applied:', data.refinement)
        this.options.onRefinementApplied?.(data.session_id, data.refinement, data.tool_name)
        break
      case 'error':
        const error: LabeebError = new Error(data.message) as LabeebError
        if (data.pending_tool) {
          error.pendingTool = data.pending_tool
        }
        this.options.onError?.(error)
        break
      case 'pong':
        break
    }
  }

  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected')
    }
    this.ws.send(JSON.stringify({
      type: 'message',
      content,
      session_id: this.sessionId
    }))
  }

  approve(sessionId: string, decision: 'approve' | 'reject', reason?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected')
    }
    this.ws.send(JSON.stringify({
      type: 'approve',
      session_id: sessionId,
      decision,
      reason
    }))
  }

  sendClarificationResponse(sessionId: string, action: 'proceed' | 'refine', refinement?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected')
    }
    const payload: Record<string, unknown> = {
      type: 'clarification_response',
      session_id: sessionId,
      action
    }
    if (action === 'refine' && refinement) {
      payload.refinement = refinement
    }
    this.ws.send(JSON.stringify(payload))
  }

  setSessionId(sessionId: string | null): void {
    this.sessionId = sessionId
  }

  getSessionId(): string | null {
    return this.sessionId
  }

  disconnect(): void {
    this.stopPingInterval()
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1)
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch(() => {
        })
      }, delay)
    }
  }
}

const LABEEB_API_URL = import.meta.env.VITE_LABEEB_API_URL || 'ws://Labeeb-Servi-WqxKpTaxpSEK-1382785740.eu-west-1.elb.amazonaws.com'

export function getLabeebApiUrl(): string {
  return LABEEB_API_URL
}
