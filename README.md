# FinTrack

FinTrack is a full stack AI-powered personal finance and nutrition tracker with:

- `frontend/` React + Vite + Tailwind CSS + Recharts + PWA support
- `backend/` Spring Boot 3 + Java 17 + Maven + MongoDB
- Google Gemini integration for food photo analysis with a safe fallback when `GEMINI_API_KEY` is not configured

## Features

- First-time onboarding wizard with user-defined spending categories
- Profile persistence in MongoDB
- Expense tracking with dynamic category budgets
- Meal analysis and food logging
- Auto-linking meal cost into a matching food-oriented expense category when available
- Dashboard summary with budget, calories, AI insight, and recent transactions
- Calendar history with day-level delete actions
- Goal tracking for savings and calorie targets
- Dark glassmorphism UI, mobile bottom navigation, and installable PWA manifest

## Project Structure

```text
backend/
frontend/
README.md
```

## Backend Setup

Create environment variables:

```bash
MONGODB_URI=mongodb://localhost:27017/fintrack
GEMINI_API_KEY=your_gemini_key
APP_CORS_ORIGIN=http://localhost:5173
SERVER_PORT=8081
```

Run:

```bash
cd backend
./mvnw spring-boot:run
```

## Frontend Setup

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8081
VITE_USER_ID=demo-user
```

Run:

```bash
cd frontend
npm install
npm run dev
```

Build:

```bash
npm run build
```

## API Overview

- `GET /api/profile?userId=`
- `PUT /api/profile?userId=`
- `PUT /api/profile/categories?userId=`
- `POST /api/expenses`
- `GET /api/expenses?userId=&month=YYYY-MM`
- `DELETE /api/expenses/{id}`
- `POST /api/food/analyze`
- `POST /api/food/logs`
- `GET /api/food/logs?userId=&month=YYYY-MM`
- `GET /api/dashboard/summary?userId=&month=YYYY-MM`
- `GET /api/ai/insight?userId=`
- `POST /api/goals`
- `GET /api/goals?userId=`
- `GET /api/history/calendar?userId=&month=YYYY-MM`
- `DELETE /api/history/calendar/expenses?userId=&date=YYYY-MM-DD`
- `DELETE /api/history/calendar/meals?userId=&date=YYYY-MM-DD`

## Verification

- Backend: `backend\\mvnw.cmd test`
- Frontend: `npm run build`

## Notes

- No expense categories, category budgets, calorie goals, or monthly budgets are hardcoded into the product flow.
- The current frontend uses `VITE_USER_ID` for a temporary single-user setup as requested.
- If Gemini is unavailable, the food analysis endpoint returns a fallback estimate so the UI remains usable during local development.
