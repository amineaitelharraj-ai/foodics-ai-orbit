# Foodics AI Orbit (Labeeb)

## Overview
Foodics AI Orbit (Labeeb) is an AI-powered restaurant management assistant with multi-agent architecture. The backend is deployed on AWS Bedrock AgentCore, and this frontend provides the user interface for interacting with the AI assistant.

## Project Architecture

### Frontend (Main Application)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Key Dependencies**: React Router, Framer Motion, Recharts, Tanstack Query, amazon-cognito-identity-js

### Backend (External - AWS Bedrock AgentCore via WebSocket Proxy)
- Multi-agent system with Supervisor, Menu, Analytics, and Market Research agents
- WebSocket Proxy (Fargate) bridges browser clients to AgentCore
- Token passed as `?token=` query parameter (proxy adds Authorization header)
- Streaming responses with token-by-token delivery
- Human-in-the-Loop (HITL) via `confirmation_request`/`confirmation_response` messages

### Backend (Local - Optional)
- Located in `/backend` directory
- Express.js backend with fraud detection capabilities
- Uses Prisma ORM with SQLite for development

## Authentication
Uses AWS Cognito for user authentication. Configure via environment variables:
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`
- `VITE_COGNITO_REGION`

When not configured, users can continue as guests.

## Development

### Running the Frontend
```bash
npm run dev
```
The development server runs on port 5000.

### Building for Production
```bash
npm run build
```
Output goes to the `dist` directory.

### Environment Variables
Copy `.env.example` to `.env` and configure:
- `VITE_LABEEB_API_URL` - AgentCore API endpoint
- `VITE_COGNITO_*` - Cognito configuration

## Project Structure
```
/
├── src/
│   ├── components/       # UI components
│   │   ├── ui/           # Base UI components
│   │   ├── AIOrbitTabBar.tsx  # Horizontal tab bar for AI Orbit pages
│   │   ├── ApprovalModal.tsx  # HITL approval modal
│   │   ├── ChatSidebar.tsx    # Chat history sidebar (within Assistant)
│   │   └── Layout.tsx    # Main layout with collapsible sidebar
│   ├── pages/            # Page components
│   │   ├── OrbitAssistant.tsx  # AI chat interface
│   │   ├── OrbitInsights.tsx   # AI insights page
│   │   ├── InventoryGuru.tsx   # Inventory AI assistant
│   │   ├── SayAndServe.tsx     # Voice ordering
│   │   ├── PlatStudio.tsx      # AI food photography
│   │   ├── Login.tsx     # Authentication page
│   │   └── ...
│   ├── hooks/
│   │   ├── useLabeeb.ts  # Labeeb agent hook
│   │   └── ...
│   ├── services/
│   │   ├── labeeb-api.ts     # WebSocket client
│   │   ├── cognito-auth.ts   # Cognito auth service
│   │   ├── session-storage.ts # Session persistence
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication context
│   └── lib/              # Utility functions
├── public/               # Static assets
├── backend/              # Backend server (separate)
└── dist/                 # Production build output
```

## Key Features
1. **AI Chat Interface** - Real-time chat with streaming responses
2. **HITL Approval Flow** - User approval for write operations (create, update, delete)
3. **Session Persistence** - Chat history saved locally
4. **Cognito Authentication** - Secure login/signup flow
5. **Smart Actions** - Quick action buttons for common tasks

## Configuration
- Vite config: `vite.config.ts`
- Tailwind: `tailwind.config.js`
- TypeScript: `tsconfig.json`
- Environment: `.env.example`

## Navigation Structure
- **Main Sidebar**: Dashboard, Orders, Customers, Reports, Inventory, Menu, Marketing, AI Orbit, Marketplace
- **AI Orbit Section**: Single "AI Orbit" link in sidebar opens the AI Orbit area
- **AI Orbit Tab Bar**: Horizontal tabs at top for switching between Assistant, Insights, InventoryGuru, Say and Serve, PlatStudio
- **Chat History**: Collapsible panel within the Assistant page (not in main sidebar)
- **Sidebar Toggle**: Collapse button near FOODICS logo for better discoverability

## Recent Changes
- Added feedback buttons (thumbs up/down) for AI responses
- Added regenerate button to retry the last AI response
- Added syntax highlighting for code blocks with copy button
- Added copy-to-clipboard button for AI responses (hover to reveal)
- Added tool progress indicator showing what the AI is doing (e.g., "Looking up products...")
- Added keyboard hint showing "Enter to send" when input is empty
- Fixed welcome message appearing in loaded chats (only show when no real messages)
- Added markdown rendering for messages using react-markdown
- Added markdown rendering for streaming content
- Switched to autoscale deployment with Express server for proper SPA routing
- Added static.json and _redirects for SPA routing in static deployments
- Fixed WebSocket session ID tracking on reconnection (updates from complete/approval_ack events)
- Added retry logic (3 retries with exponential backoff) for message persistence
- User-visible error messages when message persistence fails
- Chat history paginated by day with "Load More" incremental loading (3 at a time)
- Tool progress indicators (tool_start/tool_end events)
- Restructured AI Orbit navigation with horizontal tab bar at top of content area
- Consolidated AI Orbit sidebar items into single "AI Orbit" link
- Added AIOrbitTabBar component for switching between AI features
- Added routes for all AI Orbit pages (InventoryGuru, SayAndServe, PlatStudio)
- Moved sidebar collapse toggle to header near FOODICS logo
- Added ChatSidebar component for chat history management with date-based grouping
- Added error display and pending approval warnings in the input area
- Disabled input when HITL approval is pending
- Added Cognito authentication with login/signup flow
- Integrated LabeebClient WebSocket service for agent communication
- Added useLabeeb hook for state management with session tracking
- Created ApprovalModal for HITL flow
- Added session persistence with API backend
- Configured for Replit environment with port 5000
- Set up static deployment configuration
