# Labeeb UI Integration Guide for Replit

## Project Overview

**Labeeb** is an AI-powered restaurant management assistant built with multi-agent architecture. The backend is deployed on AWS Bedrock AgentCore (not LangGraph Platform), and we need to build a frontend UI to interact with it.

**Key Architecture Decisions:**
- Backend: AWS Bedrock AgentCore (WebSocket + HTTP API)
- Frontend: React + TypeScript (using Orbit as base)
- Previous prototype used LangGraph Platform which had built-in Agent Chat UI

---

## Part 1: Current State Analysis

### 1.1 Backend API (AgentCore)

The Labeeb backend exposes two endpoints:

**HTTP Endpoint (`POST /invocations`):**
```typescript
// Request
{
  prompt: string;           // User message
  session_id?: string;      // Conversation thread (auto-generated if not provided)
  tenant_id?: string;       // From JWT if not provided
  role?: string;            // From JWT if not provided
}

// Response
{
  response: string;         // Agent's response
  session_id: string;       // Session ID for continuation
}
```

**WebSocket Endpoint (`/ws`):**
```typescript
// Client → Server Messages
{ type: "message", content: string, session_id?: string }
{ type: "approve", session_id: string, decision: "approve" | "reject", reason?: string }
{ type: "ping" }

// Server → Client Messages
{ type: "token", content: string }           // Streaming text chunk
{ type: "interrupt", session_id: string, action: string, tool_name: string, preview: string, arguments: object }
{ type: "complete", session_id: string }
{ type: "approval_ack", session_id: string, processed: boolean }
{ type: "error", message: string }
{ type: "pong" }
```

**Authentication:**
```typescript
Headers:
  Authorization: Bearer <cognito_access_token>
  X-User-Token: <cognito_id_token>  // Optional, preferred
```

### 1.2 Human-in-the-Loop (HITL) Flow

When the agent attempts a write operation (create/update/delete), it pauses and sends an interrupt:

```
1. User sends message: "Create a product called Latte, price 25 SAR"
2. Agent receives, starts processing
3. Agent reaches tool call: create_product({name: "Latte", price: 25})
4. Server sends interrupt event:
   {
     type: "interrupt",
     session_id: "abc123",
     action: "create_product",
     tool_name: "create_product",
     preview: "**Creating Product**\nName: Latte\nPrice: 25 SAR",
     arguments: { name: "Latte", price: 25 }
   }
5. UI shows confirmation modal to user
6. User clicks Approve/Reject
7. Client sends:
   { type: "approve", session_id: "abc123", decision: "approve" }
8. Server resumes agent execution
9. Server sends completion event with result
```

**Operations requiring HITL approval:**
- Menu: `create_product`, `update_product`, `delete_product`, `create_category`, `update_category`, `delete_category`, `create_modifier`, etc.
- Analytics: `create_customer`, `blacklist_customer`, `unblacklist_customer`

### 1.3 Agent System

```
Supervisor Agent (routes requests)
├── Menu Agent (41 MCP tools) - products, categories, combos, modifiers
├── Analytics Agent (10 MCP tools) - orders, customers, sales, loyalty
└── Market Research Agent (Tavily) - web search, competitive analysis
```

---

## Part 2: LangGraph Platform vs AgentCore API Differences

### 2.1 What LangGraph Platform Provided (we no longer use this)

```typescript
// LangGraph SDK
import { Client } from "@langchain/langgraph-sdk";

const client = new Client({ apiUrl, apiKey });
const thread = await client.threads.create();
const stream = client.runs.stream(thread.id, assistantId, {
  input: { messages: [...] },
  streamMode: "updates"
});

// Interrupt handling
await client.runs.resume(thread.id, runId, new Command({ resume: approvalValue }));
```

**LangGraph Platform features we used:**
- `client.threads.create()` - Thread management
- `client.runs.stream()` - Streaming responses
- Built-in interrupt/resume with `Command`
- Agent Chat UI support

### 2.2 AgentCore Equivalent (what we use now)

```typescript
// Custom WebSocket client (no SDK - we implement ourselves)
class LabeebClient {
  private ws: WebSocket;
  private sessionId: string;

  constructor(baseUrl: string, token: string) {
    this.ws = new WebSocket(`${baseUrl}/ws`);
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ type: "auth", token }));
    };
  }

  sendMessage(content: string): void {
    this.ws.send(JSON.stringify({
      type: "message",
      content,
      session_id: this.sessionId
    }));
  }

  approve(decision: "approve" | "reject", reason?: string): void {
    this.ws.send(JSON.stringify({
      type: "approve",
      session_id: this.sessionId,
      decision,
      reason
    }));
  }

  onToken(handler: (content: string) => void): void { /* ... */ }
  onInterrupt(handler: (interrupt: InterruptEvent) => void): void { /* ... */ }
  onComplete(handler: (sessionId: string) => void): void { /* ... */ }
}
```

**Key Differences:**
| Feature | LangGraph Platform | AgentCore |
|---------|-------------------|-----------|
| Thread Management | `client.threads.create()` | Session ID in WebSocket message |
| Streaming | `client.runs.stream()` | WebSocket `{ type: "token" }` events |
| Interrupts | `Command({ resume: value })` | `{ type: "approve", decision }` |
| Auth | API Key | Cognito JWT |
| SDK | `@langchain/langgraph-sdk` | Custom WebSocket client |

---

## Part 3: Orbit Codebase Analysis

### 3.1 What Orbit Has (can reuse)

**UI Components:**
- Chat message feed with user/assistant bubbles
- Smart Actions panel with action cards
- Modal dialogs for multi-step workflows
- Tab-based navigation (Layout.tsx)
- Dark mode support
- Responsive sidebar
- Data visualization (Recharts)
- Form components (inputs, buttons, badges)

**API Patterns:**
- Axios service with interceptors (fraud-api.ts)
- TanStack Query for server state
- WebSocket for real-time updates (fraud alerts)

**Relevant Files:**
```
src/pages/OrbitAssistant.tsx  - Chat UI (1,513 lines) ⭐ Main template
src/pages/InventoryGuru.tsx   - Investigation workflow (has modal pattern)
src/services/fraud-api.ts     - API client pattern (525 lines)
src/hooks/useFraudDetection.ts - Custom hook pattern
src/components/ui/            - Base UI components
```

### 3.2 What Orbit Lacks (needs to be built)

1. **No persistent sessions** - Messages lost on refresh
2. **No LangGraph/AgentCore integration** - Uses mock responses
3. **No HITL confirmation UI** - Only investigation modals
4. **No streaming handler** - All responses atomic
5. **No thread history** - Single session in memory
6. **No JWT auth with Cognito** - Basic token storage

---

## Part 4: Implementation Tasks for Replit

### Task 1: Create Labeeb API Service

Create `src/services/labeeb-api.ts`:

```typescript
// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface InterruptEvent {
  session_id: string;
  action: string;
  tool_name: string;
  preview: string;
  arguments: Record<string, any>;
}

interface LabeebClientOptions {
  baseUrl: string;
  token: string;
  onToken?: (content: string) => void;
  onInterrupt?: (interrupt: InterruptEvent) => void;
  onComplete?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

// Service class
export class LabeebClient {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private options: LabeebClientOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(options: LabeebClientOptions) {
    this.options = options;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.options.baseUrl}/ws`);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onerror = (error) => {
        this.options.onError?.(new Error('WebSocket error'));
        reject(error);
      };

      this.ws.onclose = () => {
        this.attemptReconnect();
      };
    });
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'token':
        this.options.onToken?.(data.content);
        break;
      case 'interrupt':
        this.sessionId = data.session_id;
        this.options.onInterrupt?.(data);
        break;
      case 'complete':
        this.sessionId = data.session_id;
        this.options.onComplete?.(data.session_id);
        break;
      case 'error':
        this.options.onError?.(new Error(data.message));
        break;
    }
  }

  sendMessage(content: string): void {
    if (!this.ws) throw new Error('Not connected');
    this.ws.send(JSON.stringify({
      type: 'message',
      content,
      session_id: this.sessionId
    }));
  }

  approve(decision: 'approve' | 'reject', reason?: string): void {
    if (!this.ws || !this.sessionId) throw new Error('No pending approval');
    this.ws.send(JSON.stringify({
      type: 'approve',
      session_id: this.sessionId,
      decision,
      reason
    }));
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    }
  }
}
```

### Task 2: Create useLabeeb Hook

Create `src/hooks/useLabeeb.ts`:

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { LabeebClient, InterruptEvent, Message } from '../services/labeeb-api';

interface UseLabeebOptions {
  baseUrl: string;
  token: string;
}

export function useLabeeb({ baseUrl, token }: UseLabeebOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<InterruptEvent | null>(null);
  const [streamingContent, setStreamingContent] = useState('');

  const clientRef = useRef<LabeebClient | null>(null);

  useEffect(() => {
    const client = new LabeebClient({
      baseUrl,
      token,
      onToken: (content) => {
        setStreamingContent(prev => prev + content);
      },
      onInterrupt: (interrupt) => {
        // Finalize streaming message before showing interrupt
        if (streamingContent) {
          setMessages(prev => [...prev, {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: streamingContent,
            timestamp: new Date()
          }]);
          setStreamingContent('');
        }
        setPendingApproval(interrupt);
        setIsLoading(false);
      },
      onComplete: () => {
        // Finalize streaming message
        if (streamingContent) {
          setMessages(prev => [...prev, {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: streamingContent,
            timestamp: new Date()
          }]);
          setStreamingContent('');
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error('Labeeb error:', error);
        setIsLoading(false);
      }
    });

    clientRef.current = client;
    client.connect().then(() => setIsConnected(true));

    return () => client.disconnect();
  }, [baseUrl, token]);

  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    setStreamingContent('');
    clientRef.current.sendMessage(content);
  }, []);

  const handleApproval = useCallback((decision: 'approve' | 'reject', reason?: string) => {
    if (!clientRef.current || !pendingApproval) return;

    // Add approval action to messages
    setMessages(prev => [...prev, {
      id: `action-${Date.now()}`,
      role: 'user',
      content: decision === 'approve'
        ? `✅ Approved: ${pendingApproval.action}`
        : `❌ Rejected: ${pendingApproval.action}${reason ? ` (${reason})` : ''}`,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    clientRef.current.approve(decision, reason);
    setPendingApproval(null);
  }, [pendingApproval]);

  return {
    messages,
    isConnected,
    isLoading,
    pendingApproval,
    streamingContent,
    sendMessage,
    handleApproval
  };
}
```

### Task 3: Create HITL Approval Modal Component

Create `src/components/ApprovalModal.tsx`:

```typescript
import { Modal, Button, Card } from './ui';

interface ApprovalModalProps {
  isOpen: boolean;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  action: string;
  toolName: string;
  preview: string;
  arguments: Record<string, any>;
}

export function ApprovalModal({
  isOpen,
  onApprove,
  onReject,
  action,
  toolName,
  preview,
  arguments: args
}: ApprovalModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <Card>
        <Card.Header>
          <Card.Title>Confirm Action</Card.Title>
          <Card.Description>
            The agent wants to perform the following action. Please review and approve or reject.
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <div className="space-y-4">
            {/* Action badge */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                {toolName}
              </span>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {preview}
              </pre>
            </div>

            {/* Arguments detail */}
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600">
                View raw arguments
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(args, null, 2)}
              </pre>
            </details>

            {/* Reject reason form */}
            {showRejectForm && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rejection reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={2}
                  placeholder="Why are you rejecting this action?"
                />
              </div>
            )}
          </div>
        </Card.Content>

        <Card.Footer className="flex justify-end gap-3">
          {!showRejectForm ? (
            <>
              <Button variant="outline" onClick={() => setShowRejectForm(true)}>
                Reject
              </Button>
              <Button variant="primary" onClick={onApprove}>
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setShowRejectForm(false)}>
                Back
              </Button>
              <Button variant="danger" onClick={() => onReject(rejectReason)}>
                Confirm Rejection
              </Button>
            </>
          )}
        </Card.Footer>
      </Card>
    </Modal>
  );
}
```

### Task 4: Modify OrbitAssistant for Real Agent Integration

Update `src/pages/OrbitAssistant.tsx`:

```typescript
import { useLabeeb } from '../hooks/useLabeeb';
import { ApprovalModal } from '../components/ApprovalModal';

export function OrbitAssistant() {
  const {
    messages,
    isConnected,
    isLoading,
    pendingApproval,
    streamingContent,
    sendMessage,
    handleApproval
  } = useLabeeb({
    baseUrl: import.meta.env.VITE_LABEEB_API_URL,
    token: localStorage.getItem('authToken') || ''
  });

  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      <div className="p-2 border-b flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Message feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="text-xs opacity-70">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <p className="whitespace-pre-wrap">{streamingContent}</p>
              <span className="animate-pulse">▋</span>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-100">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Labeeb anything..."
            className="flex-1 p-3 border rounded-lg"
            disabled={isLoading || !isConnected}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !isConnected}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {/* HITL Approval Modal */}
      <ApprovalModal
        isOpen={!!pendingApproval}
        onApprove={() => handleApproval('approve')}
        onReject={(reason) => handleApproval('reject', reason)}
        action={pendingApproval?.action || ''}
        toolName={pendingApproval?.tool_name || ''}
        preview={pendingApproval?.preview || ''}
        arguments={pendingApproval?.arguments || {}}
      />
    </div>
  );
}
```

### Task 5: Add Session Persistence

Create `src/services/session-storage.ts`:

```typescript
const SESSIONS_KEY = 'labeeb_sessions';
const ACTIVE_SESSION_KEY = 'labeeb_active_session';

interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

export const sessionStorage = {
  getSessions(): Session[] {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSession(session: Session): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  getActiveSessionId(): string | null {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  },

  setActiveSessionId(id: string): void {
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
  },

  deleteSession(id: string): void {
    const sessions = this.getSessions().filter(s => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }
};
```

### Task 6: Environment Configuration

Create `.env.example`:

```bash
# Labeeb API Configuration
VITE_LABEEB_API_URL=https://your-agentcore-endpoint.amazonaws.com

# Cognito Configuration (if using direct auth)
VITE_COGNITO_USER_POOL_ID=eu-west-1_XlpCp8IVl
VITE_COGNITO_CLIENT_ID=2r07e1ep6il2qatbc9au7cq2bi
VITE_COGNITO_REGION=eu-west-1

# Optional: Feature flags
VITE_ENABLE_VOICE=false
VITE_ENABLE_CHARTS=true
```

---

## Part 5: Testing Checklist

### 5.1 Connection Tests
- [ ] WebSocket connects successfully
- [ ] Handles connection drops gracefully
- [ ] Reconnects automatically

### 5.2 Chat Flow Tests
- [ ] User message appears in feed
- [ ] Streaming tokens appear progressively
- [ ] Complete message rendered after stream ends
- [ ] Loading state shown during processing

### 5.3 HITL Tests
- [ ] Interrupt event shows approval modal
- [ ] Preview renders correctly (markdown support)
- [ ] Approve button sends correct message
- [ ] Reject button with reason works
- [ ] Agent resumes after approval

### 5.4 Session Tests
- [ ] Messages persist on page refresh
- [ ] Can switch between sessions
- [ ] New session starts clean
- [ ] Session history sidebar works

---

## Part 6: Agent Capabilities Reference

### Menu Agent Actions

| Action | Description | HITL Required |
|--------|-------------|---------------|
| `list_categories` | List all menu categories | No |
| `list_products` | List products (with filters) | No |
| `search_products` | Search products by name/SKU | No |
| `get_product_details` | Get single product info | No |
| `create_product` | Create new product | **Yes** |
| `update_product` | Update existing product | **Yes** |
| `delete_product` | Delete product | **Yes** |
| `list_modifiers` | List modifier groups | No |
| `create_modifier` | Create modifier group | **Yes** |

### Analytics Agent Actions

| Action | Description | HITL Required |
|--------|-------------|---------------|
| `list_customers` | List customers | No |
| `search_customers` | Search by name/phone | No |
| `get_orders` | Get order history | No |
| `sales_summary` | Sales analytics | No |
| `create_customer` | Create new customer | **Yes** |
| `blacklist_customer` | Blacklist customer | **Yes** |

---

## Part 7: Quick Reference

### AgentCore Endpoint (to be deployed)
```
Production: https://labeeb.bedrock-agentcore.eu-west-1.amazonaws.com
```

### Cognito Auth (team's infrastructure)
```
User Pool: eu-west-1_XlpCp8IVl
App Client: 2r07e1ep6il2qatbc9au7cq2bi
Region: eu-west-1
```

### WebSocket Message Types

| Client → Server | Description |
|-----------------|-------------|
| `message` | Send user message |
| `approve` | Approve/reject HITL action |
| `ping` | Keep-alive |

| Server → Client | Description |
|-----------------|-------------|
| `token` | Streaming text chunk |
| `interrupt` | HITL approval request |
| `complete` | Stream finished |
| `error` | Error occurred |
| `pong` | Keep-alive response |

---

## Summary for Replit

**What to do:**
1. Load Orbit repository into Replit
2. Create LabeebClient service (Task 1)
3. Create useLabeeb hook (Task 2)
4. Create ApprovalModal component (Task 3)
5. Modify OrbitAssistant to use real agent (Task 4)
6. Add session persistence (Task 5)
7. Configure environment (Task 6)

**Key files to modify:**
- `src/pages/OrbitAssistant.tsx` - Replace mock with real agent
- `src/services/` - Add labeeb-api.ts
- `src/hooks/` - Add useLabeeb.ts
- `src/components/` - Add ApprovalModal.tsx

**Main differences from LangGraph Platform:**
- No `@langchain/langgraph-sdk` - use custom WebSocket client
- No `client.threads.create()` - session_id in messages
- No `Command({ resume })` - use `{ type: "approve" }` message
- JWT auth via Cognito, not API key
