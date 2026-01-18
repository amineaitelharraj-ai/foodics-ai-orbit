# Foodics AI Orbit

A comprehensive AI-powered dashboard for restaurant operations, built as part of the Foodics ecosystem. AI Orbit provides conversational AI assistance, predictive analytics, and intelligent inventory management.

## Features

### 🤖 AI Assistant
- **Conversational Interface**: Chat with Orbit AI for restaurant operations support
- **Smart Actions**: Quick access to common restaurant management tasks
- **Quick Commands**: Shortcut commands for inventory, sales, forecasting, and menu management
- **Proactive Alerts**: Real-time notifications for critical business events

### 📊 Insights Dashboard
- **KPI Cards**: Track stockouts prevented, sell-through rates, and AI recommendation adoption
- **Alert Timeline**: Monitor and respond to system alerts with severity-based prioritization
- **Forecast Analytics**: Compare predicted vs actual sales with interactive charts
- **Waste Analysis**: Understand waste patterns by daypart with visual breakdowns

### 🎯 Predictive Pantry
- **30-Day Forecasting**: AI-powered inventory projections with safety stock monitoring
- **Reorder Recommendations**: Intelligent purchase order suggestions with vendor information
- **Scenario Simulator**: Test different promotional and operational scenarios
- **Multi-Branch Support**: Manage inventory across multiple restaurant locations

## Design System

### Visual Guidelines
- **Typography**: IBM Plex Sans & Mono font families
- **Color Palette**: Primary purple (#5D34FF) with semantic status colors
- **Spacing**: 8-point grid system for consistent layout
- **Cards**: 16px border radius with subtle shadows
- **Touch Targets**: Minimum 44px for accessibility

### Dark Mode Support
- Fully responsive dark/light theme toggle
- Semantic color tokens for consistent theming
- Proper contrast ratios for accessibility

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing
- **TanStack Query** for server state management

### UI Components
- **Lucide React** for consistent iconography
- **Recharts** for interactive data visualizations
- **Framer Motion** for smooth animations
- **clsx** for conditional CSS classes

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd orbit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with navigation
├── pages/              # Route-level components
│   ├── OrbitAssistant.tsx    # AI chat interface
│   ├── OrbitInsights.tsx     # Analytics dashboard
│   └── PredictivePantry.tsx  # Inventory forecasting
├── App.tsx             # Root application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## API Integration

The application is designed to integrate with the following Foodics APIs:

### Chat & Actions
- `POST /orbit/v1/chat` - Streaming chat interface
- `POST /orbit/v1/actions/execute` - Execute smart actions

### Analytics & Forecasting
- `GET /booster/v1/predictive-pantry/forecast` - Inventory predictions
- `GET /booster/v1/analytics` - KPI and insights data

### Notifications
- `GET /notifications/orbit` - Real-time alert system

## Responsive Design

The application adapts to different screen sizes:

- **Desktop (≥1024px)**: Full layout with sidebar and context drawer
- **Tablet (768px-1023px)**: Collapsed context drawer under accordion
- **Mobile (≤767px)**: Stacked layout with mobile-optimized navigation

## Accessibility Features

- **WCAG AA** compliant color contrast ratios
- **Keyboard navigation** for all interactive elements
- **ARIA labels** and live regions for screen readers
- **Focus management** for modal dialogs and dynamic content

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for consistent code quality
- Tailwind CSS for styling (avoid custom CSS when possible)

### Component Patterns
- Functional components with TypeScript interfaces
- Custom hooks for reusable state logic
- Compound component patterns for complex UI elements

### Performance
- React Query for efficient server state caching
- Lazy loading for route-level code splitting
- Optimized images and icons

## Contributing

1. Follow the existing code style and patterns
2. Ensure TypeScript types are properly defined
3. Test responsive behavior across different screen sizes
4. Verify accessibility compliance
5. Update documentation for new features

## License

This project is part of the Foodics ecosystem and follows company licensing terms.

---

**Built with ❤️ by the Foodics AI Team** # Trigger redeploy with correct git author
