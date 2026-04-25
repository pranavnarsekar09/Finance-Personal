# FinTrack Frontend

A modern, responsive React-based personal finance and wellness tracking application with smooth animations, mobile-first design, and glass-morphism UI components.

## 🎯 Overview

FinTrack is a comprehensive personal management app built with **React 18**, **Vite**, **Tailwind CSS**, and **Framer Motion**. The app features a tabbed navigation interface with swipe-enabled page transitions, real-time data synchronization, and a polished dark theme with aurora gradient backgrounds.

**Tech Stack:**
- **Framework:** React 18.3.1 + React Router DOM 6.28.0
- **Build Tool:** Vite 5.4.10
- **Styling:** Tailwind CSS 3.4.15 + Custom CSS with Glassmorphism
- **Animations:** Framer Motion 11.3.19
- **Charts:** Recharts 2.13.3
- **Icons:** Lucide React 0.469.0
- **PDF Export:** jsPDF 2.5.1
- **Font:** Syne (Google Fonts)

---

## 🎨 Design System & Styling

### Color Palette
```
Primary Background: #0f1117 (Shell)
Card Background: rgba(21, 28, 43, 0.7) (Card)
Accent (Primary): #22d3ee (Cyan)
Accent (Secondary): #3bff9f (Green)
Text Primary: #e5f4ff (Ink)
Text Secondary: #8ca3b8 (Muted)
```

### Visual Effects
- **Aurora Gradient Background:** Multi-layered radial gradients (cyan & green) with linear backdrop
- **Glassmorphism:** Semi-transparent cards with backdrop blur and subtle borders
- **Glass Class:** `border border-white/10 bg-card shadow-glass backdrop-blur-xl`
- **Box Shadow:** Custom glass shadow: `0 20px 40px rgba(0, 0, 0, 0.35)`

### Component Classes

**Buttons:**
- `.action-button` - Cyan primary button with hover scale and glow effect
- `.secondary-button` - White/transparent secondary button

**Inputs:**
- `.text-input` - Rounded input with focus cyan ring
- `.select-input` - Styled select dropdown
- `.textarea-input` - Multi-line text area

**Typography:**
- `.section-title` - Large bold heading (2xl, display font)
- `.section-copy` - Small muted subtext (sm, muted color)

### Responsive Design
- **Page Shell:** Max-width 7xl with responsive padding
- **Safe Areas:** Respects device notches and safe areas
- **Desktop:** Horizontal layout support (max-width breakpoints)
- **Mobile:** Bottom navigation with 128px padding accommodation

---

## 📱 Feature Tabs

### 1. **Dashboard** (`/`)
**Purpose:** Central hub showing financial and personal overview
- **Key Metrics:** Display monthly summary, daily stats, and savings goals
- **Visual Components:**
  - Stat cards for key metrics (spending, income, savings)
  - Progress bars for goals and budget tracking
  - Savings jar visualization with animated fill
  - Dashboard charts (spending trends, macro breakdowns)
- **Interactions:**
  - Pull-to-refresh gesture support
  - Haptic feedback on refresh
  - AI-powered insights display
  - Quick actions for goal management
- **Data:** Monthly and daily aggregated data from backend

### 2. **Finance** (`/finance`)
**Purpose:** Detailed expense tracking and category management
- **Core Features:**
  - Expense logging with category selection
  - Payment method tracking (UPI, Card, Cash, etc.)
  - Recurring expense support
  - Date-based transaction entry
  - Custom notes for each expense
- **Forms:**
  - Amount input with currency formatting
  - Category dropdown (dynamic from profile)
  - Payment method selector
  - Date picker with default today
  - Notes textarea
  - Recurring toggle
- **UI Elements:**
  - Expense list with categorization
  - Progress bars for category budgets
  - Glass-morphism cards
  - Edit/delete transaction controls
- **Data Persistence:** Draft saving via `usePersistentState` hook
- **Export:** PDF report generation with jsPDF

### 3. **Food** (`/food`)
**Purpose:** Nutritional tracking and meal logging
- **Core Features:**
  - Photo-based food logging (upload and analyze)
  - Manual food entry with name and price
  - Macro-nutrient tracking and visualization
  - Category-based food organization
  - Date-based meal history
- **AI Integration:**
  - Image-to-food-analysis capability
  - Automatic macro extraction (Protein, Carbs, Fat, Calories)
  - Smart category suggestion
- **Visualization:**
  - Macro chart display (Pie/Doughnut chart via Recharts)
  - Nutritional summary
  - Food log history with timestamps
- **Forms:**
  - Image upload with preview
  - Manual food name input
  - Price input with currency
  - Category selector
  - Date picker
  - Food notes/notes
- **Data Persistence:** Draft preservation via `usePersistentState`

### 4. **Calendar** (`/calendar`)
**Purpose:** Event and milestone visualization
- **Functionality:**
  - Monthly calendar view
  - Event marking and highlighting
  - Date-based filtering
  - Multi-day event support
- **UI:** Calendar grid with color-coded events

### 5. **Activity** (`/activity`)
**Purpose:** Workout and physical activity tracking
- **Features:**
  - Activity log with type and duration
  - Exercise category support
  - Calorie burn estimation
  - Activity history timeline
  - Performance stats
- **Metrics:** Weekly/monthly activity summaries

### 6. **Chat** (`/chat`)
**Purpose:** AI-powered conversational assistant
- **Features:**
  - Real-time chat interface
  - Context-aware financial advice
  - Personal coaching and insights
  - Message history preservation
  - Typing indicators
- **Integration:** Connected to backend AI service

### 7. **Profile** (`/profile`)
**Purpose:** User settings and preferences
- **Configuration:**
  - User information editing
  - Category management (custom expense categories)
  - Goal settings
  - Notification preferences
  - Connected services management
- **Profile Data:**
  - Name, email, profile picture
  - Default categories
  - Currency and localization
- **Callbacks:** `onProfileUpdate` prop for parent synchronization

---

## 🧩 UI Components

### Layout Components

**BottomNav**
- Mobile navigation bar
- Tab indicators for current page
- Swipe gesture detection
- Active state styling

**DesktopNav**
- Horizontal navigation for larger screens
- Logo and branding
- Quick links and settings

**PageHeader**
- Page title display
- Breadcrumb navigation
- Action buttons

**ConnectionStatus**
- Online/offline indicator
- Network status badge
- Auto-recovery messaging

### UI Widgets

**Card**
- Glass-morphism container
- Flexible layout wrapper
- Shadow and border styling

**StatCard**
- Metric display card
- Icon + value + label layout
- Trend indicator support

**Button**
- Action button (cyan primary)
- Secondary button (white transparent)
- Loading state support
- Disabled state styling

**ProgressBar**
- Budget/goal progress visualization
- Color-coded fill (green to red)
- Percentage label
- Animated transitions

**SavingsJar**
- Visual savings goal indicator
- Animated fill level
- Milestone markers
- Motivational display

**ErrorBoundary**
- React error catching
- Fallback UI display
- Error logging support

### Chart Components

**DashboardCharts**
- Multi-chart dashboard
- Spending trends
- Category breakdowns
- Time-based aggregation

**MacroChart**
- Nutritional visualization
- Macro-nutrient breakdown (Protein, Carbs, Fat, Calories)
- Pie/doughnut chart via Recharts
- Legend with percentage labels

**SpendingChart**
- Expense trend visualization
- Monthly comparison
- Category-wise spending
- Interactive tooltips

---

## 🎬 Animations & Interactions

### Page Transitions
- **Swipe-based navigation:** Drag left/right to move between tabs
- **Direction-aware animations:** Slide-in from correct direction
- **Smooth easing:** `circOut` easing for natural feel
- **Framer Motion:** `AnimatePresence` with custom `variants`

### Gesture Support
- **Drag threshold:** 50px minimum for page swipe
- **Haptic feedback:** Vibration feedback on interactions
- **Pull-to-refresh:** Mobile pull gesture support
- **Drag constraints:** Elastic drag with `dragElastic={0.05}`

### Animation Classes
- `.hover:scale-[1.02]` - Button hover scaling
- `.active:scale-[0.98]` - Press feedback
- `willChange: transform, opacity` - GPU optimization
- `backface-visibility: hidden` - Anti-flicker

---

## 🔧 Hooks & Utilities

### Custom Hooks

**useAsync**
- Promise-based data fetching
- Loading/error states
- Memoized execution
- Dependency tracking

**usePersistentState**
- LocalStorage integration
- Form draft auto-saving
- State synchronization across tabs
- Automatic serialization

### Utility Functions

**API Integration (`lib/api.js`)**
- `getDashboard()` - Fetch dashboard summary
- `getExpenses()` - Retrieve expense list by month
- `getInsight()` - Get AI insights
- `getGoals()` - Fetch user goals
- `getFoodLogs()` - Retrieve food entries
- Backend communication with error handling

**Formatters (`lib/utils.js`)**
- `currency()` - Format numbers as currency
- `monthKey()` - Generate month identifier
- `todayKey()` - Generate date identifier
- `shortDate()` - Format date for display
- `haptic()` - Trigger device vibration
- `emitDataRefresh()` - Event emission for data sync
- `fileToDataUrl()` - Image file to base64 conversion

**Constants (`lib/constants.js`)**
- `USER_ID` - Current user identifier
- `MOBILE_NAV_ITEMS` - Tab navigation configuration

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── App.jsx                 # Main app with routing
│   ├── features/
│   │   ├── dashboard/              # Dashboard feature
│   │   ├── finance/                # Finance tracking
│   │   ├── food/                   # Nutrition tracking
│   │   ├── calendar/               # Calendar view
│   │   ├── activity/               # Activity tracking
│   │   ├── chat/                   # Chat interface
│   │   ├── profile/                # Profile settings
│   │   └── onboarding/             # Onboarding wizard
│   ├── components/
│   │   ├── layout/                 # Navigation & structure
│   │   ├── ui/                     # Reusable UI widgets
│   │   └── charts/                 # Data visualization
│   ├── hooks/
│   │   ├── useAsync.js             # Data fetching
│   │   └── usePersistentState.js   # LocalStorage state
│   ├── lib/
│   │   ├── api.js                  # API client
│   │   ├── constants.js            # App constants
│   │   └── utils.js                # Helper functions
│   ├── styles/
│   │   └── index.css               # Global styles + Tailwind
│   └── main.jsx                    # React entry point
├── public/
│   ├── manifest.json               # PWA manifest
│   └── service-worker.js           # Service worker
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind theme
└── postcss.config.js               # PostCSS plugins
```

---

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
- Starts on `http://localhost:5173`
- Hot module replacement enabled
- Vite dev server with fast refresh

### Build for Production
```bash
npm build
```
- Generates optimized bundle in `dist/`
- Minified and tree-shaken

### Preview Production Build
```bash
npm run preview
```
- Test production bundle locally

---

## 🌐 Responsive Design

- **Mobile First:** Optimized for phones and tablets
- **Desktop Support:** Horizontal layout for larger screens
- **Safe Area Insets:** Respects device notches and safe areas
- **Touch-friendly:** Large tap targets, gesture support
- **Adaptive Layout:** Bottom nav on mobile, side nav on desktop

---

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Focus indicators with visible outlines
- Haptic feedback for confirmation

---

## 🔒 Data & Storage

- **LocalStorage:** Draft form preservation
- **API Client:** Secure backend communication
- **Session Management:** User context retention
- **Error Boundaries:** Graceful error handling
- **Offline Support:** Service worker caching

---

## 📊 Performance Optimizations

- **Code Splitting:** Lazy-loaded feature pages via React Router
- **GPU Acceleration:** `willChange` and `backface-visibility` CSS
- **Image Optimization:** Responsive image loading
- **Bundle Optimization:** Tree-shaking via Vite
- **Memoization:** `useAsync` and custom hooks prevent unnecessary re-renders

---

## 🎯 Key Features Summary

| Feature | Description | Tech |
|---------|-------------|------|
| **Dashboard** | Overview of finances, goals, and insights | Recharts, Stat Cards |
| **Finance** | Expense tracking with categories and PDF export | jsPDF, Forms |
| **Food** | Meal logging with AI image analysis | Image Upload, Macros |
| **Calendar** | Event and milestone visualization | Calendar Grid |
| **Activity** | Workout and exercise tracking | Activity Logs |
| **Chat** | AI conversational assistant | Real-time Chat |
| **Profile** | User settings and preferences | Form Management |
| **Animations** | Smooth page transitions and interactions | Framer Motion |

---

## 🤝 Backend Integration

The frontend communicates with a backend API (Java Spring Boot) via the `api.js` client:

- Expense management endpoints
- User profile and settings
- Financial summaries and reports
- Food logging and analysis
- Chat and AI endpoints
- Goal and budget tracking

---

## 📝 Notes for AI/LLM Context

When discussing this frontend with an LLM:

1. **Architecture:** React SPA with tab-based routing and swipe gestures
2. **Styling:** Glassmorphism design with Tailwind CSS and aurora gradients
3. **State Management:** React hooks (useState, useEffect) + custom hooks for persistence
4. **Animations:** Framer Motion with direction-aware page transitions
5. **Mobile-First:** Responsive design with mobile navigation support
6. **Performance:** Code splitting, GPU acceleration, memoization
7. **Accessibility:** Semantic HTML, ARIA labels, keyboard support
8. **Data Flow:** Local state + API client for backend communication
9. **PWA Ready:** Service worker support for offline capability
10. **Dark Theme:** Aurora gradient with cyan/green accents throughout

---

**Version:** 1.0.0  
**Last Updated:** April 2026
