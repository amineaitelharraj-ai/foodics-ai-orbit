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
- **Styling:** Tailwind CSS
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
- 2026-01-18: Configured Vite server for Replit environment (port 5000, allowedHosts)
- 2026-01-18: Initial setup in Replit environment

## User Preferences
(No preferences recorded yet)
