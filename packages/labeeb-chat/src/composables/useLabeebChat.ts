import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  readonly,
  shallowRef,
  type Ref,
  type ComputedRef,
  type DeepReadonly,
} from 'vue';
import {
  LabeebClient,
  type InterruptEvent,
  type ApprovalAckEvent,
  type LabeebError,
  type QueryClarificationData,
  getLabeebApiUrl,
} from '@shared/api/labeeb-client';
import { sessionStorageApi, type Session } from '@shared/api/session-storage';
import type { Message, HITLStatus, HITLPreview } from '../types';

export interface UseLabeebChatOptions {
  token: string;
  idToken?: string;
  baseUrl?: string;
  onTokenExpired?: () => void;
}

export interface ToolStatus {
  toolName: string;
  message: string;
}

export interface UseLabeebChatReturn {
  // State
  messages: DeepReadonly<Ref<Message[]>>;
  isConnected: DeepReadonly<Ref<boolean>>;
  isLoading: ComputedRef<boolean>;
  pendingApproval: DeepReadonly<Ref<InterruptEvent | null>>;
  streamingContent: DeepReadonly<Ref<string>>;
  currentSessionId: DeepReadonly<Ref<string | null>>;
  sessions: DeepReadonly<Ref<Session[]>>;
  error: DeepReadonly<Ref<string | null>>;
  toolStatus: DeepReadonly<Ref<ToolStatus | null>>;
  complexQueryNotice: DeepReadonly<Ref<string | null>>;
  largeDataNotice: DeepReadonly<Ref<string | null>>;
  queryClarification: DeepReadonly<Ref<QueryClarificationData | null>>;

  // Methods
  sendMessage: (content: string) => void;
  handleApproval: (decision: 'approve' | 'reject', reason?: string, sessionId?: string) => void;
  handleClarificationProceed: () => void;
  handleClarificationRefine: (refinement: string) => void;
  handleClarificationCancel: () => void;
  startNewSession: () => void;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateHitlImageUrl: (sessionId: string, imageUrl: string) => void;
  clearError: () => void;
  clearComplexQueryNotice: () => void;
}

export function useLabeebChat(options: UseLabeebChatOptions): UseLabeebChatReturn {
  // State
  const messages = ref<Message[]>([]);
  const isConnected = ref(false);
  const loadingSessions = ref<Set<string>>(new Set());
  const pendingApproval = ref<InterruptEvent | null>(null);
  const streamingContent = ref('');
  const currentSessionId = ref<string | null>(null);
  const sessions = ref<Session[]>([]);
  const error = ref<string | null>(null);
  const toolStatus = ref<ToolStatus | null>(null);
  const complexQueryNotice = ref<string | null>(null);
  const largeDataNotice = ref<string | null>(null);
  const queryClarification = ref<QueryClarificationData | null>(null);

  // Internal refs (not reactive - for sync access in callbacks)
  const client = shallowRef<LabeebClient | null>(null);
  let streamingContentSync = '';
  const savedMessageIds = new Set<string>();
  let pendingSessionId: string | null = null;
  let currentSessionIdSync: string | null = null;

  // Computed
  const isLoading = computed(() => {
    if (currentSessionId.value) {
      return loadingSessions.value.has(currentSessionId.value);
    }
    if (pendingSessionId) {
      return loadingSessions.value.has(pendingSessionId);
    }
    return loadingSessions.value.size > 0;
  });

  // Helper: Set loading state for a session
  const setSessionLoading = (sessionId: string | null, loading: boolean): void => {
    if (!sessionId) return;
    const newSet = new Set(loadingSessions.value);
    if (loading) {
      newSet.add(sessionId);
    } else {
      newSet.delete(sessionId);
    }
    loadingSessions.value = newSet;
  };

  // Helper: Save current session
  const saveCurrentSession = async (sessionId: string, msgs: Message[]): Promise<void> => {
    const session: Session = {
      id: sessionId,
      messages: msgs,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: msgs.find((m) => m.role === 'user')?.content.slice(0, 50) || 'New conversation',
    };
    await sessionStorageApi.saveSession(session);
    const updatedSessions = await sessionStorageApi.getSessions();
    sessions.value = updatedSessions;
  };

  // Initialize token for session storage
  watch(
    () => options.idToken,
    (newToken) => {
      if (newToken) {
        sessionStorageApi.setToken(newToken);
      }
    },
    { immediate: true }
  );

  // Load sessions on mount
  const loadSessions = async (): Promise<void> => {
    if (!options.idToken) return;

    try {
      const savedSessions = await sessionStorageApi.getSessions();
      if (savedSessions && savedSessions.length > 0) {
        sessions.value = savedSessions;

        const activeSessionId = sessionStorageApi.getActiveSessionId();
        if (activeSessionId) {
          const activeSession = savedSessions.find((s) => s.id === activeSessionId);
          if (activeSession && activeSession.messages && activeSession.messages.length > 0) {
            currentSessionId.value = activeSessionId;
            currentSessionIdSync = activeSessionId;
            messages.value = activeSession.messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
              hitlData: m.hitlData
                ? {
                    ...m.hitlData,
                    preview: m.hitlData.preview as unknown as HITLPreview,
                  }
                : undefined,
            })) as Message[];
          }
        }
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  // Connect to WebSocket
  const connect = (): void => {
    const apiUrl = options.baseUrl || getLabeebApiUrl();
    if (!options.token) return;

    const newClient = new LabeebClient({
      baseUrl: apiUrl,
      token: options.token,
      onToken: (content) => {
        console.log('[TOKEN DEBUG] Received:', content?.substring?.(0, 100));
        streamingContentSync += content;
        streamingContent.value += content;
      },
      onInterrupt: (interrupt) => {
        if (
          currentSessionIdSync &&
          interrupt.session_id !== currentSessionIdSync &&
          interrupt.session_id !== pendingSessionId
        ) {
          console.log('Ignoring interrupt from old session:', interrupt.session_id);
          return;
        }

        const newMessages: Message[] = [];

        if (streamingContentSync) {
          newMessages.push({
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: streamingContentSync,
            timestamp: new Date(),
          });
          streamingContent.value = '';
          streamingContentSync = '';
        }

        const hitlMessage: Message = {
          id: `hitl-${interrupt.session_id}-${Date.now()}`,
          role: 'hitl',
          content: '',
          timestamp: new Date(),
          hitlData: {
            preview: interrupt.preview as unknown as HITLPreview,
            session_id: interrupt.session_id,
            tool_name: interrupt.tool_name,
            status: 'pending',
          },
        };
        newMessages.push(hitlMessage);

        messages.value = [...messages.value, ...newMessages];
        pendingApproval.value = interrupt;
        setSessionLoading(interrupt.session_id, false);
      },
      onComplete: (sessionId) => {
        if (
          currentSessionIdSync &&
          sessionId !== currentSessionIdSync &&
          sessionId !== pendingSessionId
        ) {
          console.log('Ignoring complete from old session:', sessionId);
          return;
        }

        if (streamingContentSync) {
          const newMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: streamingContentSync,
            timestamp: new Date(),
          };

          const updated = [...messages.value, newMessage];
          messages.value = updated;
          saveCurrentSession(sessionId, updated);

          // Persist messages
          const persistMessages = async (): Promise<void> => {
            for (const msg of updated) {
              if (!savedMessageIds.has(msg.id)) {
                let retries = 3;
                while (retries > 0) {
                  try {
                    await sessionStorageApi.addMessage(sessionId, msg);
                    savedMessageIds.add(msg.id);
                    break;
                  } catch (err) {
                    retries--;
                    if (retries === 0) {
                      console.error('Failed to persist message after retries:', err);
                      error.value =
                        'Some messages may not have been saved. Please check your connection.';
                    } else {
                      await new Promise((r) => setTimeout(r, 1000 * (3 - retries)));
                    }
                  }
                }
              }
            }
          };
          persistMessages();

          streamingContent.value = '';
          streamingContentSync = '';
        }

        currentSessionId.value = sessionId;
        currentSessionIdSync = sessionId;
        sessionStorageApi.setActiveSessionId(sessionId);
        setSessionLoading(sessionId, false);
        pendingSessionId = null;
        complexQueryNotice.value = null;
        largeDataNotice.value = null;
      },
      onApprovalAck: (ack: ApprovalAckEvent) => {
        if (ack.processed) {
          pendingApproval.value = null;
          currentSessionId.value = ack.session_id;
          currentSessionIdSync = ack.session_id;
          sessionStorageApi.setActiveSessionId(ack.session_id);
          saveCurrentSession(ack.session_id, messages.value);
        }
      },
      onToolStart: (toolName, message) => {
        toolStatus.value = { toolName, message };
      },
      onToolEnd: () => {
        toolStatus.value = null;
        largeDataNotice.value = null;
      },
      onComplexQueryNotice: (message) => {
        complexQueryNotice.value = message;
      },
      onLargeDataNotice: (message) => {
        largeDataNotice.value = message;
      },
      onQueryClarification: (data) => {
        queryClarification.value = data;
        setSessionLoading(data.sessionId, false);
      },
      onClarificationAck: (sessionId) => {
        setSessionLoading(sessionId, true);
      },
      onRefinementApplied: (_sessionId, refinement, _toolName) => {
        messages.value = [
          ...messages.value,
          {
            id: `refinement-${Date.now()}`,
            role: 'user',
            content: refinement,
            timestamp: new Date(),
          },
        ];
      },
      onError: (err) => {
        console.error('Labeeb error:', err);
        const labeebError = err as LabeebError;

        if (labeebError.code === 4002 || labeebError.code === 4004) {
          options.onTokenExpired?.();
          return;
        }

        if (labeebError.pendingTool) {
          error.value = `Please approve or reject the pending "${labeebError.pendingTool}" action before sending new messages.`;
        } else {
          error.value = err.message;
        }

        if (pendingSessionId) {
          setSessionLoading(pendingSessionId, false);
          pendingSessionId = null;
        }
        toolStatus.value = null;
      },
      onConnectionChange: (connected) => {
        isConnected.value = connected;
      },
    });

    client.value = newClient;

    newClient
      .connect()
      .then(() => {
        isConnected.value = true;
      })
      .catch((err) => {
        console.error('Failed to connect:', err);
        isConnected.value = false;
      });
  };

  // Methods
  const sendMessage = (content: string): void => {
    if (!client.value) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Finalize any pending streaming content
    let updatedMessages = [...messages.value];
    if (streamingContentSync && streamingContentSync.trim()) {
      const assistantMessage: Message = {
        id: `assistant-${Date.now() - 1}`,
        role: 'assistant',
        content: streamingContentSync,
        timestamp: new Date(),
      };
      updatedMessages = [...updatedMessages, assistantMessage];
      console.log('Finalized pending streaming content before new message');
    }

    messages.value = [...updatedMessages, userMessage];
    streamingContent.value = '';
    streamingContentSync = '';

    const sessionId = currentSessionId.value || `pending-${Date.now()}`;
    pendingSessionId = sessionId;
    setSessionLoading(sessionId, true);

    try {
      client.value.sendMessage(content);
    } catch (err) {
      console.error('Failed to send message:', err);
      setSessionLoading(sessionId, false);
      pendingSessionId = null;
    }
  };

  const handleApproval = (
    decision: 'approve' | 'reject',
    reason?: string,
    sessionId?: string
  ): void => {
    if (!client.value) return;

    const targetSessionId = sessionId || pendingApproval.value?.session_id;
    if (!targetSessionId) return;

    messages.value = messages.value.map((msg) => {
      if (
        msg.role === 'hitl' &&
        msg.hitlData?.session_id === targetSessionId &&
        msg.hitlData.status === 'pending'
      ) {
        return {
          ...msg,
          hitlData: {
            ...msg.hitlData,
            status: (decision === 'approve' ? 'approved' : 'rejected') as HITLStatus,
          },
        };
      }
      return msg;
    });

    pendingSessionId = targetSessionId;
    setSessionLoading(targetSessionId, true);

    try {
      client.value.approve(targetSessionId, decision, reason);
    } catch (err) {
      console.error('Failed to send approval:', err);
      setSessionLoading(targetSessionId, false);
      pendingSessionId = null;
    }

    pendingApproval.value = null;
  };

  const updateHitlImageUrl = (sessionId: string, imageUrl: string): void => {
    messages.value = messages.value.map((msg) => {
      if (msg.role === 'hitl' && msg.hitlData?.session_id === sessionId) {
        return {
          ...msg,
          hitlData: {
            ...msg.hitlData,
            generatedImageUrl: imageUrl,
          },
        };
      }
      return msg;
    });
  };

  const startNewSession = (): void => {
    messages.value = [];
    currentSessionId.value = null;
    currentSessionIdSync = null;
    streamingContent.value = '';
    streamingContentSync = '';
    pendingApproval.value = null;
    loadingSessions.value = new Set();
    toolStatus.value = null;
    pendingSessionId = null;
    savedMessageIds.clear();
    if (client.value) {
      client.value.setSessionId(null);
    }
    sessionStorageApi.setActiveSessionId('');
  };

  const loadSession = async (sessionId: string): Promise<void> => {
    try {
      const session = await sessionStorageApi.getSession(sessionId);
      if (session && session.messages && session.messages.length > 0) {
        savedMessageIds.clear();
        session.messages.forEach((m) => savedMessageIds.add(m.id));

        loadingSessions.value = new Set();
        toolStatus.value = null;
        streamingContent.value = '';
        streamingContentSync = '';
        pendingSessionId = null;

        messages.value = session.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          hitlData: m.hitlData
            ? {
                ...m.hitlData,
                preview: m.hitlData.preview as unknown as HITLPreview,
              }
            : undefined,
        })) as Message[];
        currentSessionId.value = sessionId;
        currentSessionIdSync = sessionId;
        if (client.value) {
          client.value.setSessionId(sessionId);
        }
        sessionStorageApi.setActiveSessionId(sessionId);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    await sessionStorageApi.deleteSession(sessionId);
    const updatedSessions = await sessionStorageApi.getSessions();
    sessions.value = updatedSessions;
    if (currentSessionId.value === sessionId) {
      startNewSession();
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  const clearComplexQueryNotice = (): void => {
    complexQueryNotice.value = null;
  };

  const handleClarificationProceed = (): void => {
    if (!queryClarification.value || !client.value) return;
    client.value.sendClarificationResponse(queryClarification.value.sessionId, 'proceed');
    setSessionLoading(queryClarification.value.sessionId, true);
    queryClarification.value = null;
  };

  const handleClarificationRefine = (refinement: string): void => {
    if (!queryClarification.value || !client.value) return;
    client.value.sendClarificationResponse(
      queryClarification.value.sessionId,
      'refine',
      refinement
    );
    setSessionLoading(queryClarification.value.sessionId, true);
    queryClarification.value = null;
  };

  const handleClarificationCancel = (): void => {
    queryClarification.value = null;
  };

  // Lifecycle
  onMounted(() => {
    loadSessions();
    connect();
  });

  onUnmounted(() => {
    client.value?.disconnect();
  });

  return {
    // State (readonly)
    messages: readonly(messages),
    isConnected: readonly(isConnected),
    isLoading,
    pendingApproval: readonly(pendingApproval),
    streamingContent: readonly(streamingContent),
    currentSessionId: readonly(currentSessionId),
    sessions: readonly(sessions),
    error: readonly(error),
    toolStatus: readonly(toolStatus),
    complexQueryNotice: readonly(complexQueryNotice),
    largeDataNotice: readonly(largeDataNotice),
    queryClarification: readonly(queryClarification),

    // Methods
    sendMessage,
    handleApproval,
    handleClarificationProceed,
    handleClarificationRefine,
    handleClarificationCancel,
    startNewSession,
    loadSession,
    deleteSession,
    updateHitlImageUrl,
    clearError,
    clearComplexQueryNotice,
  };
}
