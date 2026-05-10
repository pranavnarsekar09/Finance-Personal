# Project Overview

Welcome to **Personal Finance Tracker** – a full‑stack application that helps you manage your finances, track meals, and visualize spending habits. The frontend is built with React, TypeScript, and a modern design system, providing a smooth, swipe‑driven experience on both desktop and mobile.

---

## Navigation Tabs

The app features four primary top‑level tabs, each representing a major area of functionality. Some tabs contain sub‑tabs for finer navigation.

| Tab | Sub‑Tabs | Description | Core Components |
|-----|----------|-------------|-----------------|
| **Home** | `overview` • `budget` • `spending` | Dashboard overview displaying balances, goals, spending charts and quick actions. | `BalanceCard`, `InsightCard`, `StreakCard`, `CalorieBar`, `JarsRow`, `SpendChart`, `CategoryPressure`, `Tabs` (internal UI), `AnimatePresence`, `motion` |
| **Money** | `list` • `calendar` | Manage and view every expense. Switch between a list view and a calendar heat‑map view. | `ExpenseItem`, `CalendarGrid`, `Tabs`, `AnimatePresence`, `motion`, `useSwipeNative` |
| **Health** | `today` • `week` | Log meals, view daily nutrition, and see a weekly summary of calories, protein, carbs & fats. | SVG arc visualisation, `Utensils`, `Camera`, `useSwipeNative`, `JarsRow`‑style progress bars, `useDashboard`, `useFoodLogs` |
| **You** (Profile) | – | User profile management, theme toggle, category administration, and data export (JSON / PDF / Excel). | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `Input`, `Button`, `AlertCircle`, `FileText`, `FileSpreadsheet`, `Sun`, `Moon`, `Check`, `Plus`, `Edit2`, `Trash2`, data‑export utilities (`jspdf`, `xlsx`) |

---

## Tab Details

### Home Tab

- **Overview** – Shows the current month’s budget status, recent expenses, and quick‑action cards (`BalanceCard`, `InsightCard`).
- **Budget** – Allows editing of the monthly budget, calorie goal, and managing savings goals. Utilises `BudgetTab` component (contains form inputs, goal list, and spending trend chart).
- **Spending** – Lists recent transactions with filters, search, and pagination. Uses `SpendingTab` component and `ExpenseItem` cards.

#### Key Components
- `BalanceCard` – Displays total budget, spent amount, available balance, and streak.
- `InsightCard` – Shows AI‑generated financial insights.
- `StreakCard` & `CalorieBar` – Visualise daily streaks and calorie consumption.
- `JarsRow` – Savings‑jar visualisation.
- `SpendChart` – Monthly spending line chart.
- `CategoryPressure` – Category‑wise spending breakdown.

### Money Tab

- **List View** – Tabular list of expenses with filtering by category and full‑text search. Each row is an `ExpenseItem` with delete capability.
- **Calendar View** – Calendar heat‑map where each day shows a coloured dot if expenses exist. Clicking a day reveals that day’s expenses.

#### Key Components
- `ExpenseItem` – Card displaying expense details, amount, and delete button.
- `CalendarGrid` – Renders a month grid, handles month navigation, and displays daily total.
- `Tabs` – Custom UI component (`src/components/ui/tabs.tsx`) providing the list/calendar toggle.

### Health Tab

- **Today** – Radial progress arcs visualise calories, protein, carbs, and fat consumed today versus goals. Provides quick‑action buttons to log a meal or launch the AI‑photo analyzer.
- **Week** – Summarises weekly averages for calories, macro‑nutrients, and displays a mock bar chart for each day of the week.

#### Key Components
- SVG arc visualisation (custom circles for each macro).
- `Utensils`, `Camera` icons for actions.
- `useDashboard` & `useFoodLogs` hooks fetch data.
- `JarsRow`‑style progress bars for macro percentages.

### You (Profile) Tab

- Shows user avatar, name, email, and budget/calorie summary.
- **Categories** – Manage spending categories (add, edit, delete) via a modal dialog.
- **Appearance** – Light/Dark theme toggle.
- **Data Management** – Export all data (profile, goals, finance, expenses, food logs) as JSON, PDF, or Excel files.

#### Key Components
- `Dialog` family (`DialogContent`, `DialogHeader`, etc.) for category CRUD.
- Theme switch buttons with `Sun`/`Moon` icons.
- Export buttons (`FileText`, `Download`, `FileSpreadsheet`).
- Storage usage indicator using `useStorageUsage`.
- Data‑export helpers (`jspdf`, `jspdf-autotable`, `xlsx`).

---

## How to Navigate

1. **Swipe** left/right or tap the tab buttons at the top of each page to switch between main tabs.
2. Within a tab, tap sub‑tab buttons (e.g., *Overview*, *Budget*, *Spending*) to change the view.
3. Use the *Add* / *Edit* buttons in the **You** tab to manage categories and personal settings.
4. Export your data from the **You** tab anytime via the *JSON / PDF / Excel* buttons.

---

## Development Notes

- All UI components live under `src/components/ui/` (e.g., `tabs.tsx`, `button.tsx`).
- State management is handled by React hooks (`useState`, `useEffect`, custom `useApi` hooks).
- Swipe gestures are powered by `useSwipeNative` and `useHaptic` for tactile feedback on mobile.
- The app follows a dark‑mode‑first design with glass‑morphism and smooth micro‑animations.

---

*Happy budgeting & healthy eating!*
