import { ref, computed, watch, readonly, type Ref, type ComputedRef, type DeepReadonly } from 'vue';
import { sessionStorageApi, type Session } from '@shared/api/session-storage';
import type { Message } from '../types/messages';

export interface UseLabeebSessionOptions {
  token?: string;
  autoLoad?: boolean;
}

export interface UseLabeebSessionReturn {
  // State
  sessions: DeepReadonly<Ref<Session[]>>;
  activeSession: DeepReadonly<Ref<Session | null>>;
  activeSessionId: DeepReadonly<Ref<string | null>>;
  isLoading: DeepReadonly<Ref<boolean>>;
  error: DeepReadonly<Ref<string | null>>;

  // Computed
  hasActiveSession: ComputedRef<boolean>;
  sessionCount: ComputedRef<number>;

  // Methods
  loadSessions: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<Session | null>;
  createSession: (title?: string) => Promise<Session | null>;
  setActiveSession: (sessionId: string | null) => void;
  saveSession: (session: Session) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearAllSessions: () => Promise<void>;
  generateSessionId: () => string;
  setToken: (token: string | null) => void;
}

export function useLabeebSession(options: UseLabeebSessionOptions = {}): UseLabeebSessionReturn {
  // State
  const sessions = ref<Session[]>([]);
  const activeSession = ref<Session | null>(null);
  const activeSessionId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const hasActiveSession = computed(() => activeSession.value !== null);
  const sessionCount = computed(() => sessions.value.length);

  // Initialize token if provided
  if (options.token) {
    sessionStorageApi.setToken(options.token);
  }

  // Generate unique session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  // Set authentication token
  const setToken = (token: string | null): void => {
    sessionStorageApi.setToken(token);
  };

  // Load all sessions from API
  const loadSessions = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const fetchedSessions = await sessionStorageApi.getSessions();
      sessions.value = fetchedSessions;

      // Restore active session from local storage
      const storedActiveId = sessionStorageApi.getActiveSessionId();
      if (storedActiveId) {
        const found = fetchedSessions.find((s) => s.id === storedActiveId);
        if (found) {
          activeSession.value = found;
          activeSessionId.value = storedActiveId;
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load sessions';
    } finally {
      isLoading.value = false;
    }
  };

  // Load a specific session
  const loadSession = async (sessionId: string): Promise<Session | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const session = await sessionStorageApi.getSession(sessionId);
      if (session) {
        // Update in sessions list
        const index = sessions.value.findIndex((s) => s.id === sessionId);
        if (index >= 0) {
          sessions.value[index] = session;
        } else {
          sessions.value.push(session);
        }
      }
      return session;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load session';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Create a new session
  const createSession = async (title?: string): Promise<Session | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const newSession: Session = {
        id: generateSessionId(),
        title: title || 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = await sessionStorageApi.createSession(newSession);
      if (created) {
        sessions.value.unshift(created);
        setActiveSession(created.id);
        return created;
      }

      // If API is not available, use local session
      sessions.value.unshift(newSession);
      setActiveSession(newSession.id);
      return newSession;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create session';
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // Set the active session
  const setActiveSession = (sessionId: string | null): void => {
    if (sessionId === null) {
      activeSession.value = null;
      activeSessionId.value = null;
      sessionStorageApi.setActiveSessionId('');
      return;
    }

    const session = sessions.value.find((s) => s.id === sessionId);
    if (session) {
      activeSession.value = session;
      activeSessionId.value = sessionId;
      sessionStorageApi.setActiveSessionId(sessionId);
    }
  };

  // Save a session
  const saveSession = async (session: Session): Promise<void> => {
    try {
      await sessionStorageApi.saveSession(session);

      // Update local state
      const index = sessions.value.findIndex((s) => s.id === session.id);
      if (index >= 0) {
        sessions.value[index] = { ...session, updatedAt: new Date() };
      }

      if (activeSession.value?.id === session.id) {
        activeSession.value = { ...session, updatedAt: new Date() };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save session';
    }
  };

  // Add a message to the active session
  const addMessage = async (message: Message): Promise<void> => {
    if (!activeSession.value) {
      error.value = 'No active session';
      return;
    }

    try {
      await sessionStorageApi.addMessage(activeSession.value.id, message);

      // Update local state
      activeSession.value.messages.push(message);
      activeSession.value.updatedAt = new Date();

      // Update title if this is the first user message
      if (message.role === 'user' && activeSession.value.messages.length === 1) {
        activeSession.value.title = sessionStorageApi.generateTitle([message]);
        await saveSession(activeSession.value);
      }
    } catch (e) {
      // Even if API fails, keep message in local state
      console.error('Failed to persist message:', e);
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: string): Promise<void> => {
    try {
      await sessionStorageApi.deleteSession(sessionId);

      // Remove from local state
      sessions.value = sessions.value.filter((s) => s.id !== sessionId);

      // Clear active session if it was deleted
      if (activeSession.value?.id === sessionId) {
        setActiveSession(null);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete session';
    }
  };

  // Clear all sessions
  const clearAllSessions = async (): Promise<void> => {
    try {
      await sessionStorageApi.clearAllSessions();
      sessions.value = [];
      setActiveSession(null);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to clear sessions';
    }
  };

  // Watch for token changes (from auth composable)
  watch(
    () => options.token,
    (newToken) => {
      if (newToken !== undefined) {
        setToken(newToken);
        if (options.autoLoad) {
          loadSessions();
        }
      }
    },
    { immediate: options.autoLoad }
  );

  return {
    // State (readonly)
    sessions: readonly(sessions),
    activeSession: readonly(activeSession),
    activeSessionId: readonly(activeSessionId),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    hasActiveSession,
    sessionCount,

    // Methods
    loadSessions,
    loadSession,
    createSession,
    setActiveSession,
    saveSession,
    addMessage,
    deleteSession,
    clearAllSessions,
    generateSessionId,
    setToken,
  };
}
