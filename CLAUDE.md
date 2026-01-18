# CLAUDE.md - Foodics AI Orbit Vue 3 Migration

> **THIS IS YOUR MISSION BRIEF. READ COMPLETELY BEFORE STARTING.**

---

## MANDATORY INSTRUCTIONS - READ FIRST

### CRITICAL RULES

1. **QUALITY OVER SPEED** - No shortcuts. Token cost is NOT a concern.
2. **USE SUB-AGENT WORKFLOW** - Each component migrates in isolated context (see workflow below)
3. **VALIDATE AFTER EVERY TASK** - Build, lint, test before proceeding
4. **COMMIT CHECKPOINTS** - Every completed task gets a commit
5. **NO `any` TYPES** - Full TypeScript strictness required
6. **FRESH CONTEXT PER TASK** - Spawn sub-agents for complex migrations

### PROJECT GOAL

Migrate the AI Orbit application from **React** to **Vue 3**, with the Labeeb Chat component designed as an **extractable widget** from day 1.

**Source:** `react-reference/` folder (the original React codebase)
**Target:** New Vue 3 monorepo structure

### WHY VUE 3?

- The Foodics team already uses Vue 3
- Clean slate - no inheriting React mess
- Widget-first architecture from the start
- Better long-term maintainability

---

## PROJECT STRUCTURE (TARGET)

```
foodics-ai-orbit/
├── packages/
│   └── labeeb-chat/                    # EXTRACTABLE WIDGET PACKAGE
│       ├── src/
│       │   ├── index.ts                # Public exports
│       │   ├── LabeebChat.vue          # Root component
│       │   ├── LabeebChatProvider.vue  # Context provider
│       │   ├── composables/            # Vue 3 Composition API
│       │   │   ├── useLabeebWebSocket.ts
│       │   │   ├── useLabeebChat.ts
│       │   │   ├── useLabeebSession.ts
│       │   │   └── useLabeebAuth.ts
│       │   ├── components/
│       │   │   ├── MessageList.vue
│       │   │   ├── MessageBubble.vue
│       │   │   ├── ChatInput.vue
│       │   │   ├── StreamingIndicator.vue
│       │   │   ├── StructuredResponse.vue
│       │   │   ├── QueryClarification.vue
│       │   │   └── hitl/               # All 14 HITL cards
│       │   │       ├── HITLCard.vue
│       │   │       ├── ProductCard.vue
│       │   │       └── ... (13 more)
│       │   ├── types/
│       │   │   ├── messages.ts
│       │   │   └── hitl-previews.ts
│       │   └── styles/
│       │       └── labeeb-chat.css
│       ├── widget/
│       │   ├── index.ts
│       │   └── LabeebWidget.ts
│       ├── package.json
│       └── vite.config.ts
├── apps/
│   └── orbit/                          # MAIN AI ORBIT APP
│       ├── src/
│       │   ├── App.vue
│       │   ├── main.ts
│       │   ├── router/
│       │   ├── layouts/
│       │   ├── pages/
│       │   ├── components/
│       │   └── stores/
│       ├── package.json
│       └── vite.config.ts
├── shared/
│   └── api/
│       └── labeeb-client.ts            # WebSocket client (from React)
├── react-reference/                    # ORIGINAL REACT CODE (READ-ONLY REFERENCE)
│   └── src/
│       ├── hooks/useLabeeb.ts
│       ├── services/labeeb-api.ts
│       ├── components/hitl/*.tsx
│       └── pages/OrbitAssistant.tsx
├── package.json
├── pnpm-workspace.yaml
├── CLAUDE.md                           # THIS FILE
└── README.md
```

---

## SUB-AGENT WORKFLOW (MANDATORY)

### Why Sub-Agents?

- Large migrations cause **context bloat**
- Quality degrades as context grows
- Fresh context per task = better results
- Commits as checkpoints = recoverable progress

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  MASTER AGENT (You - Coordinator)                                │
│                                                                  │
│  1. Setup monorepo structure                                     │
│  2. For EACH task:                                               │
│     a. Spawn sub-agent with RICH context (see template below)    │
│     b. Wait for completion                                       │
│     c. Run validation: pnpm build, pnpm lint                     │
│     d. Commit checkpoint: git commit -m "feat(...): ..."         │
│     e. PASS → next task | FAIL → investigate/fix                 │
│  3. Run comprehensive tests at end                               │
│  4. Cleanup react-reference/ folder                              │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  SUB-AGENT #1   │  │  SUB-AGENT #2   │  │  SUB-AGENT #N   │
│  (Fresh Context)│  │  (Fresh Context)│  │  (Fresh Context)│
│                 │  │                 │  │                 │
│ • Read React    │  │ • Read React    │  │ • Read React    │
│ • Write Vue     │  │ • Write Vue     │  │ • Write Vue     │
│ • Validate      │  │ • Validate      │  │ • Validate      │
│ • Return result │  │ • Return result │  │ • Return result │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Sub-Agent Prompt Template

When spawning a sub-agent for a task, provide this context:

```markdown
## Task: {NUMBER} - {TITLE}

### Files
- React source: `react-reference/{PATH}`
- Vue target: `{NEW_PATH}`

### WHY This Matters
{Explain how this component fits in the architecture}

### React Source Code
```tsx
{PASTE FULL REACT SOURCE HERE}
```

### Vue 3 Conversion Rules

**State:**
- `useState(x)` → `const x = ref(initialValue)`
- `setState(v)` → `x.value = v`

**Effects:**
- `useEffect(() => {}, [])` → `onMounted(() => {})`
- `useEffect cleanup` → `onUnmounted(() => {})`
- `useEffect(() => {}, [dep])` → `watch(dep, () => {})`

**Props/Events:**
- Props: `defineProps<T>()`
- Events: `defineEmits<T>()`
- `onClick={fn}` → `@click="fn"`
- `{cond && <X />}` → `<X v-if="cond" />`

**Component Structure:**
```vue
<script setup lang="ts">
// imports
// props/emits
// composables
// reactive state
// computed
// methods
// lifecycle
</script>

<template>
  <!-- template -->
</template>

<style scoped>
/* styles if needed */
</style>
```

### Code Standards
1. Use `<script setup lang="ts">` ALWAYS
2. NO `any` types - proper typing required
3. Use `ref()` for primitives, `reactive()` for objects
4. Tailwind classes work unchanged from React

### Validation
1. File compiles: `pnpm --filter @foodics/labeeb-chat build`
2. Lint passes: `pnpm --filter @foodics/labeeb-chat lint`

### Commit Format
feat(labeeb-chat): add {ComponentName}

- Migrated from {ReactSource}
- {Key changes}
```

---

## REACT → VUE 3 TRANSLATION GUIDE

### State Management

| React | Vue 3 |
|-------|-------|
| `useState(value)` | `ref(value)` |
| `useState({...})` | `reactive({...})` |
| `setX(newVal)` | `x.value = newVal` |
| `useMemo(() => x, [deps])` | `computed(() => x)` |
| `useCallback(fn, [deps])` | Just `const fn = () => {}` |
| `useRef(null)` | `ref(null)` for DOM, plain var for values |

### Lifecycle

| React | Vue 3 |
|-------|-------|
| `useEffect(() => {}, [])` | `onMounted(() => {})` |
| `useEffect cleanup return` | `onUnmounted(() => {})` |
| `useEffect(() => {}, [dep])` | `watch(dep, () => {})` |
| `useEffect(() => {}, [dep1, dep2])` | `watch([dep1, dep2], () => {})` |

### Context

| React | Vue 3 |
|-------|-------|
| `createContext()` | N/A (use provide/inject) |
| `useContext(Ctx)` | `inject(key)` |
| `<Ctx.Provider value={x}>` | `provide(key, x)` |

### Props & Events

**React:**
```tsx
interface Props {
  message: string;
  onSend: (text: string) => void;
}

function Component({ message, onSend }: Props) {
  return <button onClick={() => onSend(message)}>Send</button>;
}
```

**Vue 3:**
```vue
<script setup lang="ts">
interface Props {
  message: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  send: [text: string];
}>();
</script>

<template>
  <button @click="emit('send', message)">Send</button>
</template>
```

### Conditional Rendering

| React | Vue 3 |
|-------|-------|
| `{cond && <X />}` | `<X v-if="cond" />` |
| `{cond ? <A /> : <B />}` | `<A v-if="cond" /><B v-else />` |
| `{items.map(i => <X key={i.id} />)}` | `<X v-for="i in items" :key="i.id" />` |

### Class Binding

| React | Vue 3 |
|-------|-------|
| `className="static"` | `class="static"` |
| `className={dynamic}` | `:class="dynamic"` |
| `className={\`a ${cond ? 'b' : ''}\`}` | `:class="['a', { 'b': cond }]"` |

---

## TASK LIST (42 Tasks)

### Phase 1: Foundation (Tasks 1-5) - SEQUENTIAL

| # | Task | Source | Target | Notes |
|---|------|--------|--------|-------|
| 1 | Create monorepo structure | - | Root configs | pnpm-workspace, tsconfig, etc. |
| 2 | Configure Vite + TS + Tailwind | - | packages/labeeb-chat/ | Vue 3 + Vite setup |
| 3 | Copy types | react-reference/src/types/*.ts | packages/labeeb-chat/src/types/ | Direct copy |
| 4 | Copy labeeb-client.ts | react-reference/src/services/labeeb-api.ts | shared/api/labeeb-client.ts | Pure TS, minimal changes |
| 5 | Create useLabeebWebSocket | labeeb-api.ts | composables/useLabeebWebSocket.ts | Wrap client in composable |

### Phase 2: Core Composables (Tasks 6-9) - SEQUENTIAL

| # | Task | React Source | Vue Target |
|---|------|--------------|------------|
| 6 | useLabeebAuth | contexts/AuthContext.tsx | composables/useLabeebAuth.ts |
| 7 | useLabeebSession | services/session-storage.ts | composables/useLabeebSession.ts |
| 8 | useLabeebChat | hooks/useLabeeb.ts | composables/useLabeebChat.ts |
| 9 | LabeebChatProvider | - | LabeebChatProvider.vue |

### Phase 3: Chat UI (Tasks 10-15)

| # | Task | React Source | Vue Target |
|---|------|--------------|------------|
| 10 | MessageBubble | OrbitAssistant.tsx (extract) | components/MessageBubble.vue |
| 11 | ChatInput | OrbitAssistant.tsx (extract) | components/ChatInput.vue |
| 12 | StreamingIndicator | OrbitAssistant.tsx (extract) | components/StreamingIndicator.vue |
| 13 | MessageList | OrbitAssistant.tsx (extract) | components/MessageList.vue |
| 14 | StructuredResponse | StructuredResponse.tsx | components/StructuredResponse.vue |
| 15 | QueryClarification | QueryClarificationModal.tsx | components/QueryClarification.vue |

### Phase 4: HITL Cards (Tasks 16-29)

| # | Task | React Source | Vue Target |
|---|------|--------------|------------|
| 16 | HITLCard (dispatcher) | hitl/HITLCard.tsx | hitl/HITLCard.vue |
| 17 | ProductCard | hitl/ProductCard.tsx | hitl/ProductCard.vue |
| 18 | CategoryCard | hitl/CategoryCard.tsx | hitl/CategoryCard.vue |
| 19 | CustomerCard | hitl/CustomerCard.tsx | hitl/CustomerCard.vue |
| 20 | PointsCard | hitl/PointsCard.tsx | hitl/PointsCard.vue |
| 21 | LoyaltyProgramCard | hitl/LoyaltyProgramCard.tsx | hitl/LoyaltyProgramCard.vue |
| 22 | LoyaltyRewardCard | hitl/LoyaltyRewardCard.tsx | hitl/LoyaltyRewardCard.vue |
| 23 | PromotionCard | hitl/PromotionCard.tsx | hitl/PromotionCard.vue |
| 24 | ComboCard | hitl/ComboCard.tsx | hitl/ComboCard.vue |
| 25 | ModifierCard | hitl/ModifierCard.tsx | hitl/ModifierCard.vue |
| 26 | BranchCard | hitl/BranchCard.tsx | hitl/BranchCard.vue |
| 27 | SupplierCard | hitl/SupplierCard.tsx | hitl/SupplierCard.vue |
| 28 | InventoryTransactionCard | hitl/InventoryTransactionCard.tsx | hitl/InventoryTransactionCard.vue |
| 29 | InventoryCountCard | hitl/InventoryCountCard.tsx | hitl/InventoryCountCard.vue |

### Phase 5: Main Component (Task 30)

| # | Task | Description |
|---|------|-------------|
| 30 | LabeebChat.vue | Root component combining all above |

### Phase 6: AI Orbit App (Tasks 31-37)

| # | Task | Description |
|---|------|-------------|
| 31 | OrbitLayout.vue | Main layout with nav + tabs |
| 32 | LeftNav.vue | Icon sidebar (from OrbitAssistant) |
| 33 | TopTabs.vue | Tab navigation |
| 34 | ChatHistory.vue | Session list sidebar |
| 35 | Assistant.vue | Main page using LabeebChat |
| 36 | Vue Router setup | Route configuration |
| 37 | Pinia stores | Auth + sessions stores |

### Phase 7: Widget (Tasks 38-40)

| # | Task | Description |
|---|------|-------------|
| 38 | Widget entry point | widget/index.ts + LabeebWidget.ts |
| 39 | Widget build config | Vite library mode, UMD output |
| 40 | Test widget embed | HTML test page |

### Phase 8: Final (Tasks 41-42)

| # | Task | Description |
|---|------|-------------|
| 41 | Comprehensive testing | Full test suite |
| 42 | Cleanup react-reference/ | Remove after migration complete |

---

## KEY REACT FILES TO STUDY

### Critical Files (Read these first)

1. **`react-reference/src/pages/OrbitAssistant.tsx`** (2007 lines)
   - Main chat page - VERY COMPLEX
   - Contains: message rendering, streaming, HITL inline cards
   - Extract into multiple Vue components

2. **`react-reference/src/hooks/useLabeeb.ts`** (496 lines)
   - WebSocket state management
   - Message handling, streaming, approvals
   - Becomes `useLabeebChat.ts` composable

3. **`react-reference/src/services/labeeb-api.ts`** (341 lines)
   - WebSocket client class
   - Pure TypeScript - minimal changes needed
   - Copy to `shared/api/labeeb-client.ts`

4. **`react-reference/src/types/hitl-previews.ts`**
   - All HITL preview type definitions
   - Direct copy - no changes needed

5. **`react-reference/src/components/hitl/*.tsx`** (14 files)
   - All HITL card components
   - Well-modularized, straightforward migration

### Supporting Files

- `react-reference/src/components/StructuredResponse.tsx` - Tables/charts
- `react-reference/src/components/QueryClarificationModal.tsx` - Filter dialog
- `react-reference/src/components/ChatSidebar.tsx` - Session list
- `react-reference/src/contexts/AuthContext.tsx` - Auth context
- `react-reference/src/services/session-storage.ts` - Session persistence

---

## WEBSOCKET PROTOCOL

### Client → Server Messages

```typescript
{ type: "message", content: string, session_id?: string }
{ type: "approve", session_id: string }
{ type: "reject", session_id: string, reason?: string }
{ type: "clarification_response", session_id: string, action: "proceed" | "refine" }
{ type: "ping" }
```

### Server → Client Messages

```typescript
{ type: "token", content: string }              // Streaming text
{ type: "tool_start", tool_name: string }       // Tool starting
{ type: "tool_end", tool_name: string }         // Tool finished
{ type: "interrupt", session_id, preview, ... } // HITL approval needed
{ type: "query_clarification", ... }            // Clarification needed
{ type: "complete", session_id: string }        // Session done
{ type: "error", message: string }              // Error
{ type: "pong" }                                // Ping response
```

---

## HITL PREVIEW TYPES (14 Types)

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

---

## TECH STACK

| Category | Choice |
|----------|--------|
| Framework | Vue 3.4+ (Composition API) |
| Build | Vite 5+ |
| Language | TypeScript 5+ (strict mode) |
| Styling | Tailwind CSS 3+ |
| State (app) | Pinia |
| State (widget) | Composables only |
| Router | Vue Router 4 |
| Charts | ECharts or Chart.js (NOT Recharts) |
| Icons | Lucide Vue Next |
| Package Manager | pnpm |
| Testing | Vitest + Vue Test Utils |

---

## VALIDATION COMMANDS

```bash
# After each task:
pnpm --filter @foodics/labeeb-chat build
pnpm --filter @foodics/labeeb-chat lint
pnpm --filter @foodics/labeeb-chat test  # when tests exist

# Full build:
pnpm build

# Type check:
pnpm typecheck
```

---

## COMMIT FORMAT

```
feat(labeeb-chat): add ComponentName

- Migrated from react-reference/src/path/File.tsx
- Key change 1
- Key change 2

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## CLEANUP (After Migration Complete)

Once all 41 tasks are done:

1. Run full test suite
2. Verify widget builds correctly
3. Delete `react-reference/` folder
4. Update README.md
5. Create release

---

## START HERE

1. Read this entire document
2. Explore `react-reference/src/` to understand the codebase
3. Start with Task 1: Create monorepo structure
4. Follow the task list sequentially for foundation tasks
5. Use sub-agents for complex component migrations
6. Validate after EVERY task
7. Commit after EVERY successful task

**QUALITY IS PARAMOUNT. NO SHORTCUTS.**
