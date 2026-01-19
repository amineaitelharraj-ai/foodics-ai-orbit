# Foodics AI Orbit

## Overview
Orbit is a Vue 3 frontend application built with Vite. It's part of a pnpm monorepo that includes multiple packages.

## Project Structure
```
/
├── apps/
│   └── orbit/          # Main Vue 3 application (frontend)
├── packages/
│   └── labeeb-chat/    # Chat widget package
├── shared/             # Shared utilities and types
├── package.json        # Root workspace config
└── pnpm-workspace.yaml # Monorepo workspace configuration
```

## Tech Stack
- **Framework:** Vue 3
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with Foodics preset
- **UI Components:** @foodics/ui-common (FdxButton, FdxCard, FdxChip, FdxAlert, FdxInputText, FdxInputPassword)
- **State Management:** Pinia
- **Routing:** Vue Router
- **Package Manager:** pnpm (monorepo workspace)

## Running the Application
The main dev command runs the Orbit app:
```bash
pnpm dev
```
This starts the Vite dev server on port 5000.

## Recent Changes
- 2026-01-19: Integrated @foodics/ui-common component library:
  - Added Foodics Tailwind preset and global CSS
  - Login page: FdxButton, FdxInputText, FdxInputPassword, FdxCard, FdxAlert
  - ChatInput: FdxButton, FdxChip, FdxAlert (native textarea for auto-resize)
  - HITLCardWrapper: FdxCard, FdxButton, FdxChip
  - ChatSidebar: FdxButton, FdxInputText
- 2026-01-19: Implemented missing Labeeb chat features:
  - ChatSidebar component (session history with search, date grouping, session management)
  - MarkdownRenderer component (full GFM support, syntax highlighting, copy code buttons)
  - Image Generation service (product image generation via AI API)
  - Updated MessageBubble to use MarkdownRenderer for assistant messages
- 2026-01-18: Configured Vite server for Replit environment (port 5000, allowedHosts)
- 2026-01-18: Initial setup in Replit environment

## Labeeb Chat Components
The `packages/labeeb-chat/` package includes:
- **LabeebChat** - Main chat widget component
- **ChatSidebar** - Session history navigation sidebar
- **MarkdownRenderer** - Full markdown rendering with syntax highlighting
- **MessageBubble** - Chat message display with feedback actions
- **StreamingIndicator** - Loading/streaming status with Arabic-themed messages
- **QueryClarification** - HITL clarification modal
- **StructuredResponse** - Tables, charts, cards display
- **HITL Cards** - 14 specialized preview cards (Product, Category, Order, etc.)

## User Preferences
(No preferences recorded yet)
