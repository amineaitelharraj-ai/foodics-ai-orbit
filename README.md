# Foodics AI Orbit

> Vue 3 + TypeScript implementation of AI Orbit with Labeeb Chat widget

## Overview

AI Orbit is an intelligent business companion for Foodics restaurant operations. This repository contains the Vue 3 migration of the original React application, with the Labeeb Chat component designed as an extractable widget.

## Project Status

🚧 **Migration In Progress**

- [ ] Foundation setup
- [ ] Core composables
- [ ] Chat UI components
- [ ] HITL cards (14 types)
- [ ] Main LabeebChat component
- [ ] AI Orbit app shell
- [ ] Widget build
- [ ] Testing & documentation

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  AI ORBIT FULL APP                                              │
│  ┌──────────┬─────────────────────────────────────────────────┐ │
│  │ Left Nav │  ┌─────────┬──────────────────────────────────┐ │ │
│  │          │  │ Chat    │  ┌────────────────────────────┐  │ │ │
│  │  Icons   │  │ History │  │                            │  │ │ │
│  │          │  │         │  │    LabeebChat Component    │  │ │ │
│  │          │  │ + New   │  │    (REUSABLE CORE)         │  │ │ │
│  │          │  │         │  │                            │  │ │ │
│  │          │  │ Sessions│  │  - Messages + Streaming    │  │ │ │
│  │          │  │         │  │  - HITL Cards (14 types)   │  │ │ │
│  │          │  │         │  │  - Structured Responses    │  │ │ │
│  │          │  │         │  │  - Input + Suggestions     │  │ │ │
│  │          │  └─────────┴──────────────────────────────┘  │ │ │
│  └──────────┴─────────────────────────────────────────────────┘ │
│  Tabs: Assistant | Insights | InventoryGuru | Say&Serve | Plat  │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
foodics-ai-orbit/
├── packages/
│   └── labeeb-chat/          # Extractable widget package
│       ├── src/
│       │   ├── composables/  # Vue 3 Composition API hooks
│       │   ├── components/   # UI components
│       │   └── types/        # TypeScript definitions
│       └── widget/           # Widget entry point
├── apps/
│   └── orbit/                # Main AI Orbit application
├── shared/
│   └── api/                  # Shared API client
├── react-reference/          # Original React code (reference only)
└── CLAUDE.md                 # Migration instructions
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3 (Composition API) |
| Build | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Pinia |
| Router | Vue Router |
| Package Manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## LabeebChat Component

### Usage in Vue App

```vue
<script setup lang="ts">
import { LabeebChat, LabeebChatProvider } from '@foodics/labeeb-chat';
</script>

<template>
  <LabeebChatProvider
    :access-token="token"
    :ws-url="wsUrl"
    @token-expired="handleExpired"
  >
    <LabeebChat
      :show-suggestions="true"
      theme="auto"
    />
  </LabeebChatProvider>
</template>
```

### Usage as Widget

```html
<div id="labeeb-chat"></div>
<script src="https://cdn.labeeb.com/widget.js"></script>
<script>
  LabeebWidget.init({
    container: '#labeeb-chat',
    accessToken: 'your-token',
    wsUrl: 'wss://labeeb.foodics.com',
    theme: 'light',
    position: 'bottom-right'
  });
</script>
```

## Features

- **Real-time Chat** - WebSocket-based streaming responses
- **HITL Approval** - Human-in-the-loop approval cards for AI actions
- **Structured Responses** - Tables, charts, and cards
- **Query Clarification** - Smart filter dialogs for large data queries
- **Session Management** - Persistent chat history
- **Dark Mode** - Full dark mode support

## HITL Preview Types

The chat supports 14 types of human-in-the-loop approval cards:

1. Products (create, update, delete, restore)
2. Categories
3. Modifiers (+ attach/detach)
4. Branches
5. Suppliers (+ attach/detach)
6. Customers (+ blacklist/unblacklist, tags)
7. Combos (add/remove products, modifiers)
8. Loyalty Points (award/redeem)
9. Loyalty Programs
10. Loyalty Rewards
11. Promotions (+ activate/deactivate, extend)
12. Inventory Transactions (stock in/out)
13. Inventory Counts

## Development

### Migration Guide

See [CLAUDE.md](./CLAUDE.md) for detailed migration instructions from React to Vue 3.

### React Reference

The original React codebase is preserved in `react-reference/` for reference during migration. This folder will be removed after migration is complete.

## License

Proprietary - Foodics

## Links

- [Foodics](https://www.foodics.com)
- [API Documentation](https://docs.foodics.com)
