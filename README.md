# Project Overview

This repository contains a full‑stack personal finance and health tracking application. The **frontend** is built with React, TypeScript, Tailwind CSS, and Framer Motion. Navigation is driven by a three‑tab layout on the **Home** page, plus dedicated pages for health, money, and user profile.

---

## 📋 Home Page – Tab Navigation

The `Home` component (`src/pages/Home.tsx`) defines three top‑level tabs stored in `HOME_TABS`:

| Tab | File | What It Shows | Key Components Used |
|-----|------|---------------|---------------------|
| **overview** | `src/pages/Home.tsx` (rendered via `<OverviewTab />`) | A dashboard summary of the current month: profile greeting, budget snapshot, recent spending, calorie intake, streak, and quick actions. | `BalanceCard`, `InsightCard`, `StreakCard`, `CalorieBar`, `JarsRow`, `SpendChart`, `CategoryPressure` |
| **budget** | `src/pages/Home.tsx` (rendered via `<BudgetTab />`) | Settings for monthly budget, calorie goal, goal creation, and expense‑trend chart. | `SpendingTrendChart`, `Select`, `Input` (for budget, calorie, goal fields) |
| **spending** | `src/pages/Home.tsx` (rendered via `<SpendingTab />`) | Current daily limit, buffer, savings, and UI to edit those values. Also displays recent daily finance records. | `Input`, `QueryLoadingCard`, `QueryErrorCard` |

The tab bar is animated with Framer Motion; swiping left/right changes the tab with a directional animation.

---

## 🔬 Health Page (`src/pages/Health.tsx`)

| Section | Description |
|---------|-------------|
| **Today View** | Shows the remaining calories for the day, arcs for calories, protein, carbs, and fat, plus quick buttons to log a meal or use the AI‑photo analyzer. |
| **Week View** | Displays weekly averages for calories, protein, carbs, fat, and fiber, along with a mock bar‑chart of daily intake and a history list of each day’s totals. |

Key hooks: `useDashboard`, `useFoodLogs`, `useDeleteFoodLog`. UI uses `motion.div` for animated transitions between “today” and “week”.

---

## 💰 Money Page (`src/pages/Money.tsx`)

*(Not shown in the current file list but exists in the `pages` folder.)*

- Shows the user’s **finance settings**: daily limit, buffer, savings, and tracking start date.
- Allows editing those values and saving them via `useSaveFinance`.
- Lists recent daily finance records with buffer and savings outcomes.
- Provides a quick‑save button and explanatory banner.

---

## 🙋‍♀️ You Page (`src/pages/You.tsx`)

*(Also present in `src/pages`.)*

- Profile summary with the user’s initials avatar.
- Settings to update the profile name, email, monthly budget, and calorie goal.
- Goal management UI: create new goals, view current goals, and see progress bars.
- Uses the same `Select` and `Input` components as the Budget tab.

---

## 📚 Common UI Building Blocks

| Component | Purpose |
|-----------|---------|
| `BalanceCard` | Displays total budget, spent amount, today’s spend, remaining budget, and savings.
| `InsightCard` | Shows AI‑generated insights (e.g., spending patterns).
| `StreakCard` | Visualizes the current streak of meeting goals.
| `CalorieBar` | Circular progress of calories consumed vs goal.
| `JarsRow` | Visual representation of budget “jars”.
| `SpendChart` | Line chart of daily spending.
| `CategoryPressure` | Bar chart of spending per category.
| `SpendingTrendChart` | Line chart for expense trends over time.
| `QueryLoadingCard` / `QueryErrorCard` | Standard loading and error UI for API queries.

---

## 🛠️ Implementation Notes

- **State management** is handled with React Query hooks (`useDashboard`, `useFinance`, `useGoals`, etc.).
- **Animations** use Framer Motion’s `AnimatePresence` and direction‑aware variants for smooth tab transitions.
- **Swiping** is powered by a custom `useSwipeNative` hook that updates the tab based on left/right gestures.
- **Styling** relies on Tailwind CSS with a custom design token palette (mint, coral, sun, sky, etc.) for a premium glass‑morphism look.

---

## 📄 How to Run

```bash
# From the project root
npm install
npm run dev   # Starts the Vite dev server (frontend) and Spring Boot backend separately
```

The frontend will be served at `http://localhost:5173` and will proxy API calls to the backend (running on the default Spring port).

---

*This README provides a quick reference for developers and contributors to understand each tab/page, what it displays, and the core components involved.*
