# Labeeb Chat Component - Reusable Widget Architecture

> **Context:** This analysis will be shared with **Replit** for implementation. We need a critical, challenging assessment - not just "yes we can do it" but a thorough evaluation of trade-offs.

---

## Your Role: Critical Analyst

Act as a **challenging technical reviewer**. Your job is to:

1. **Poke holes** in the proposed approach
2. **Identify risks** and hidden complexity
3. **Question assumptions** about code reuse
4. **Recommend the best path** even if it's not what was asked

Be direct. If this is a bad idea, say so. If splitting into separate projects makes more sense, recommend that.

---

## The Question

Can we architect the Labeeb chat component to be:
1. **Used inside AI Orbit** - as it works today (full React app)
2. **Embedded as a widget** - in any web page (Foodics Console, partner sites, etc.)

We want ONE chat component codebase that works in both scenarios.

**But should we?** That's what we need you to evaluate.

---

## Current State

The chat is currently tightly coupled to the AI Orbit React app:

```
src/
├── pages/
│   └── OrbitAssistant.tsx      # Main page (1700+ lines, includes chat)
├── hooks/
│   └── useLabeeb.ts            # WebSocket state management
├── services/
│   └── labeeb-api.ts           # WebSocket client
├── components/
│   ├── StructuredResponse.tsx  # Tables, charts rendering
│   └── HITLCard.tsx            # Approval cards (new)
└── utils/
    └── message-utils.ts        # JSON detection
```

**Problem:** `OrbitAssistant.tsx` is a full page component, not a reusable chat widget.

---

## Proposed Architecture

```
src/
├── components/
│   └── labeeb-chat/                    # EXTRACTABLE CHAT COMPONENT
│       ├── index.ts                    # Main export
│       ├── LabeebChat.tsx              # Root component
│       ├── LabeebChatProvider.tsx      # Context provider (auth, config)
│       ├── hooks/
│       │   ├── useLabeebChat.ts        # Chat state (messages, streaming)
│       │   ├── useLabeebWebSocket.ts   # WebSocket connection
│       │   └── useLabeebAuth.ts        # Token management
│       ├── components/
│       │   ├── MessageList.tsx         # Message container
│       │   ├── MessageBubble.tsx       # User/assistant messages
│       │   ├── ChatInput.tsx           # Input box + send button
│       │   ├── StreamingIndicator.tsx  # "Preparing answer..."
│       │   ├── StructuredResponse.tsx  # Tables, charts
│       │   ├── HITLCard.tsx            # Inline approval cards
│       │   └── QueryClarification.tsx  # Filter dialogs
│       ├── types/
│       │   └── index.ts                # TypeScript interfaces
│       └── styles/
│           └── labeeb-chat.css         # Scoped styles
│
├── pages/
│   └── OrbitAssistant.tsx              # Uses <LabeebChat /> internally
│
└── widget/                              # WIDGET BUILD TARGET
    ├── index.ts                         # Widget entry point
    └── LabeebWidget.ts                  # Wraps LabeebChat for embedding
```

---

## Usage in Both Contexts

### Context 1: Inside AI Orbit (React App)

```tsx
// pages/OrbitAssistant.tsx
import { LabeebChat, LabeebChatProvider } from '@/components/labeeb-chat';

function OrbitAssistant() {
  const { user } = useAuth();  // Existing Cognito auth

  return (
    <div className="orbit-page">
      <Sidebar />
      <main>
        <LabeebChatProvider
          accessToken={user.accessToken}
          refreshToken={user.refreshToken}
          wsUrl="wss://labeeb.foodics.com"
          restApiUrl="https://49891xz0p8.execute-api.eu-west-1.amazonaws.com/dev"
        >
          <LabeebChat
            showHistory={true}
            showSuggestions={true}
            theme="auto"
          />
        </LabeebChatProvider>
      </main>
    </div>
  );
}
```

### Context 2: Standalone Widget (Embed)

```html
<!-- Any webpage -->
<div id="labeeb-chat"></div>
<script src="https://cdn.labeeb.com/widget.js"></script>
<script>
  LabeebWidget.init({
    container: '#labeeb-chat',
    // Auth tokens (from host app via token exchange)
    accessToken: hostApp.labeebToken,
    // Config
    wsUrl: 'wss://labeeb.foodics.com',
    restApiUrl: 'https://49891xz0p8.execute-api.eu-west-1.amazonaws.com/dev',
    // Options
    showHistory: false,      // Minimal for widget
    showSuggestions: true,
    theme: 'light',
    position: 'bottom-right' // Widget-specific
  });
</script>
```

---

## Component API Design

### LabeebChatProvider Props

```typescript
interface LabeebChatProviderProps {
  // Authentication (required)
  accessToken: string;
  refreshToken?: string;
  onTokenExpired?: () => void;

  // Endpoints
  wsUrl?: string;           // Default: wss://labeeb.foodics.com
  restApiUrl?: string;      // Default: production API

  // Callbacks
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
  onHITLApprove?: (preview: HITLPreview) => void;
  onHITLReject?: (preview: HITLPreview, reason?: string) => void;

  children: React.ReactNode;
}
```

### LabeebChat Props

```typescript
interface LabeebChatProps {
  // UI Options
  showHistory?: boolean;        // Show chat history sidebar (default: true)
  showSuggestions?: boolean;    // Show quick action buttons (default: true)
  showFeedback?: boolean;       // Show thumbs up/down (default: true)
  placeholder?: string;         // Input placeholder text

  // Theming
  theme?: 'light' | 'dark' | 'auto';
  className?: string;           // Additional CSS class
  style?: React.CSSProperties;  // Inline styles

  // Widget-specific (ignored in app context)
  position?: 'inline' | 'bottom-right' | 'bottom-left';
  collapsible?: boolean;        // Can minimize widget
  defaultCollapsed?: boolean;   // Start minimized
}
```

---

## Key Features to Preserve

Both contexts must support:

| Feature | Description |
|---------|-------------|
| WebSocket streaming | Real-time token streaming with loading states |
| Structured responses | Tables, charts, cards based on `display_type` |
| HITL inline cards | All 13 preview types with approve/reject |
| AI image generation | REST API call from product HITL cards |
| Query clarification | Filter dialogs for large data queries |
| Reconnection | Auto-reconnect on WebSocket disconnect |
| Token refresh | Handle expired tokens gracefully |

---

## Authentication Flow (Token Exchange)

The widget receives a **Foodics OAuth token** from the host app and exchanges it for Cognito tokens.

```
Host App                    Widget                      Labeeb Backend
   │                          │                              │
   │  1. Foodics OAuth token  │                              │
   │─────────────────────────>│                              │
   │                          │                              │
   │                          │  2. Token exchange           │
   │                          │  (via backend proxy)         │
   │                          │─────────────────────────────>│
   │                          │                              │
   │                          │  3. Cognito tokens           │
   │                          │<─────────────────────────────│
   │                          │                              │
   │                          │  4. WebSocket connect        │
   │                          │─────────────────────────────>│
```

**Recommended:** Host app backend handles token exchange, passes Cognito tokens to widget.

```typescript
// Token exchange endpoint (your backend)
POST /api/labeeb/auth
Body: { foodicsToken, tenantId, userId, role }
Response: { accessToken, refreshToken, expiresIn }
```

---

## Build Strategy

### For AI Orbit App
- Normal React build
- `LabeebChat` imported as component
- Shares app's React instance

### For Standalone Widget
- Separate build target (Vite/Rollup)
- Bundles React (or Preact for smaller size)
- Outputs: `labeeb-widget.js` + `labeeb-widget.css`
- UMD format for `<script>` tag usage
- ESM format for npm package

```javascript
// vite.config.widget.js
export default {
  build: {
    lib: {
      entry: 'src/widget/index.ts',
      name: 'LabeebWidget',
      formats: ['umd', 'es']
    },
    rollupOptions: {
      output: {
        globals: {}  // No external dependencies
      }
    }
  }
}
```

---

## Styling Strategy

To avoid CSS conflicts when embedded:

1. **Scoped CSS** - All classes prefixed with `labeeb-`
2. **CSS Variables** - Themeable via variables
3. **Shadow DOM** (optional) - Full isolation

```css
/* labeeb-chat.css */
.labeeb-chat {
  --labeeb-primary: #4F46E5;
  --labeeb-bg: #ffffff;
  --labeeb-text: #1f2937;
  /* ... */
}

.labeeb-chat[data-theme="dark"] {
  --labeeb-bg: #1f2937;
  --labeeb-text: #f9fafb;
}

.labeeb-message { /* ... */ }
.labeeb-input { /* ... */ }
.labeeb-hitl-card { /* ... */ }
```

---

## Critical Questions to Answer

### Feasibility
1. **Is this even a good idea?** Or are we forcing code reuse where it doesn't belong?
2. **What's the extraction effort?** Is the current `OrbitAssistant.tsx` (1700+ lines) too tangled?
3. **Hidden dependencies?** What else does the chat rely on that we haven't considered?

### Architecture Decision
4. **One repo or two?** Should we:
   - **Option A:** Extract component within same repo (monorepo approach)
   - **Option B:** Create separate `labeeb-chat-widget` repo/package
   - **Option C:** Keep them completely separate (duplicate some code)

5. **What breaks?** If we extract, what current AI Orbit features break or get complicated?

### Technical Trade-offs
6. **Bundle size:** Can widget be <100KB? What do we sacrifice?
7. **Preact vs React:** Is Preact compatibility worth the constraints?
8. **Shadow DOM:** Necessary evil or overkill?
9. **Shared state:** How do we handle chat history, auth state across contexts?

### Maintenance Concerns
10. **Two build targets = two problems?** Will we regret maintaining dual builds?
11. **Version drift:** How do we keep widget and app chat in sync?
12. **Testing burden:** Do we need to test both contexts for every change?

---

## Deliverables

> **Remember:** This output goes to Replit for implementation. Be specific and actionable.

### 1. Honest Assessment
- Is this approach sound or are we overcomplicating things?
- What's the **real** effort (days/weeks)?
- What are the top 3 risks?

### 2. Recommendation: Project Structure
Pick ONE and justify:

| Option | Description | When to Choose |
|--------|-------------|----------------|
| **A: Monorepo extraction** | Extract to `packages/labeeb-chat` in same repo | If code is already modular, shared tooling helps |
| **B: Separate package** | New `@labeeb/chat-widget` npm package | If widget needs independent release cycle |
| **C: Separate codebases** | Copy what's needed, maintain independently | If reuse is a false economy |
| **D: Don't do it** | Keep chat in AI Orbit only, build widget from scratch | If extraction cost > rewrite cost |

### 3. Implementation Plan (if proceeding)
- Phase 1: What to do first
- Phase 2: What comes next
- Phase 3: Polish and release
- Estimated effort per phase

### 4. Component API (if proceeding)
- Final `LabeebChat` props
- Final `LabeebChatProvider` props
- Event callbacks

### 5. Open Questions for Replit
- What decisions need Replit's input?
- What constraints should they be aware of?

---

## Reference: WebSocket Protocol

<details>
<summary>Click to expand WebSocket message types</summary>

### Client → Server
```typescript
{ type: "message", content: string, session_id?: string }
{ type: "approve", session_id: string }
{ type: "reject", session_id: string, reason?: string }
{ type: "clarification_response", session_id: string, action: "proceed" | "refine" }
{ type: "ping" }
```

### Server → Client
```typescript
{ type: "token", content: string }
{ type: "tool_start", tool_name: string, message: string }
{ type: "tool_end", tool_name: string }
{ type: "interrupt", session_id, tool_name, preview, arguments }
{ type: "query_clarification", session_id, tool_name, message, options }
{ type: "complete", session_id: string }
{ type: "error", message: string }
{ type: "pong" }
```

</details>

---

## Reference: HITL Preview Types

<details>
<summary>Click to expand all 13 preview types</summary>

1. `product_preview` - Products (create, update, delete, restore)
2. `category_preview` - Categories
3. `modifier_preview` - Modifiers (+ attach/detach)
4. `branch_preview` - Branches
5. `supplier_preview` - Suppliers (+ attach/detach)
6. `customer_preview` - Customers (+ blacklist/unblacklist, tags)
7. `combo_preview` - Combos (add/remove products, modifiers)
8. `points_preview` - Loyalty points (award/redeem)
9. `loyalty_program_preview` - Loyalty programs
10. `loyalty_reward_preview` - Loyalty rewards
11. `promotion_preview` - Promotions (+ activate/deactivate, extend)
12. `inventory_transaction_preview` - Stock in/out
13. `inventory_count_preview` - Stock counts

</details>

---

## What We're NOT Asking

- Don't just say "yes, it's possible" - everything is possible with enough effort
- Don't give a generic component library tutorial
- Don't assume the proposed architecture is correct

## What We ARE Asking

1. **Challenge the premise** - Should we even do this?
2. **Evaluate the current code** - Is it extractable or a mess?
3. **Make a recommendation** - One clear path forward
4. **Be specific** - Replit needs to implement this

---

## Final Output Format

Structure your response as:

```markdown
## Executive Summary
[2-3 sentences: Is this feasible? What do you recommend?]

## Assessment
[Detailed analysis of current code, complexity, risks]

## Recommendation
[Your recommended option (A/B/C/D) with justification]

## Implementation Plan
[If proceeding, specific steps for Replit]

## Open Questions
[What needs more discussion before starting]
```

---

Please analyze the current codebase and provide your critical assessment.
