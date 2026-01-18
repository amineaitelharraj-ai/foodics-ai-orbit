/**
 * Session Storage Service
 * Manages chat sessions via API with local caching
 */

import type { Message } from './labeeb-client';

// Environment configuration
function getEnvVar(key: string): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || '';
  }
  return '';
}

const CHAT_API_URL = getEnvVar('VITE_CHAT_API_URL');
const ACTIVE_SESSION_KEY = 'labeeb_active_session';

export interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

interface ApiChat {
  chatId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  messageCount?: number;
  messages?: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

let cachedToken: string | null = null;

export const sessionStorageApi = {
  setToken(token: string | null): void {
    cachedToken = token;
  },

  getToken(): string | null {
    return cachedToken;
  },

  async getSessions(): Promise<Session[]> {
    if (!CHAT_API_URL || !cachedToken) {
      console.log('getSessions: No API URL or token configured');
      return [];
    }

    try {
      const response = await fetch(`${CHAT_API_URL}/chats`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cachedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch sessions:', response.status);
        return [];
      }

      const result = (await response.json()) as ApiChat[] | { chats: ApiChat[] };
      const data: ApiChat[] = Array.isArray(result) ? result : result.chats || [];

      return data.map((chat) => ({
        id: chat.chatId,
        title: chat.title || 'Untitled',
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: (chat.messages || []).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      return [];
    }
  },

  async getSession(sessionId: string): Promise<Session | null> {
    if (!CHAT_API_URL || !cachedToken) {
      return null;
    }

    try {
      const response = await fetch(`${CHAT_API_URL}/chats/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cachedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        console.error('Failed to fetch session:', response.status);
        return null;
      }

      const chat = (await response.json()) as ApiChat;
      return {
        id: chat.chatId,
        title: chat.title || 'Untitled',
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: (chat.messages || []).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        })),
      };
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
  },

  async createSession(session: Session): Promise<Session | null> {
    if (!CHAT_API_URL || !cachedToken) {
      return null;
    }

    try {
      const response = await fetch(`${CHAT_API_URL}/chats`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cachedToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          title: session.title || 'New Chat',
        }),
      });

      if (!response.ok) {
        console.error('Failed to create session:', response.status);
        return null;
      }

      const chat = (await response.json()) as ApiChat;
      return {
        id: chat.chatId,
        title: chat.title || 'Untitled',
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: [],
      };
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  },

  async saveSession(session: Session): Promise<void> {
    if (!CHAT_API_URL || !cachedToken) {
      return;
    }

    try {
      const response = await fetch(`${CHAT_API_URL}/chats/${session.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${cachedToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: session.title || this.generateTitle(session.messages),
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          await this.createSession(session);
        } else {
          console.error('Failed to save session:', response.status);
        }
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  async addMessage(sessionId: string, message: Message): Promise<void> {
    if (!CHAT_API_URL || !cachedToken) {
      return;
    }

    const response = await fetch(`${CHAT_API_URL}/chats/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save message: ${response.status}`);
    }
  },

  generateTitle(messages: Message[]): string {
    const firstUserMessage = messages.find((m) => m.role === 'user');
    if (firstUserMessage) {
      const content = firstUserMessage.content.trim();
      return content.length > 50 ? content.substring(0, 47) + '...' : content;
    }
    return 'New Chat';
  },

  getActiveSessionId(): string | null {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  },

  setActiveSessionId(id: string): void {
    if (id) {
      localStorage.setItem(ACTIVE_SESSION_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  },

  async deleteSession(id: string): Promise<void> {
    if (!CHAT_API_URL || !cachedToken) {
      return;
    }

    try {
      const response = await fetch(`${CHAT_API_URL}/chats/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${cachedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok && response.status !== 404) {
        console.error('Failed to delete session:', response.status);
      }

      if (this.getActiveSessionId() === id) {
        this.setActiveSessionId('');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  },

  async clearAllSessions(): Promise<void> {
    const sessions = await this.getSessions();
    await Promise.all(sessions.map((s) => this.deleteSession(s.id)));
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  },
};
