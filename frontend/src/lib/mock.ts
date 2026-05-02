export const user = { name: "Nico", initials: "NP", email: "nico@fintrack.app" };

export const balance = { total: 4000, spent: 2024, available: 1976 };

export const insight = {
  headline: "You're pacing 12% under budget — keep it up.",
  runwayDays: 22,
  avgDailySpend: 64,
};

export const streak = [
  { d: "M", on: true }, { d: "T", on: true }, { d: "W", on: true },
  { d: "T", on: true }, { d: "F", on: true }, { d: "S", on: false }, { d: "S", on: false },
];

export const calories = { eaten: 1420, goal: 2200 };

export const jars = [
  { name: "Tokyo Trip", pct: 64, days: 92, color: "mint" },
  { name: "New MacBook", pct: 32, days: 140, color: "sun" },
  { name: "Emergency", pct: 88, days: 30, color: "coral" },
];

export const spendWeek = [
  { d: "Mon", v: 42 }, { d: "Tue", v: 78 }, { d: "Wed", v: 35 },
  { d: "Thu", v: 96 }, { d: "Fri", v: 120 }, { d: "Sat", v: 58 }, { d: "Sun", v: 64 },
];

export const categories = [
  { name: "Groceries", icon: "🥬", spent: 320, cap: 500, color: "mint" },
  { name: "Dining", icon: "🍜", spent: 280, cap: 250, color: "coral" },
  { name: "Transport", icon: "🚇", spent: 96, cap: 200, color: "sky-pastel" },
  { name: "Shopping", icon: "🛍️", spent: 410, cap: 600, color: "sun" },
  { name: "Subscriptions", icon: "📺", spent: 48, cap: 80, color: "lavender" },
];

export const transactions = [
  { id: 1, merchant: "Blue Bottle Coffee", category: "Dining", amount: 6.50, date: "Today", method: "Card", icon: "☕" },
  { id: 2, merchant: "Whole Foods", category: "Groceries", amount: 64.20, date: "Today", method: "Card", icon: "🛒" },
  { id: 3, merchant: "Uber", category: "Transport", amount: 14.80, date: "Yesterday", method: "Card", icon: "🚗" },
  { id: 4, merchant: "Netflix", category: "Subscriptions", amount: 15.99, date: "Yesterday", method: "Card", icon: "🎬" },
  { id: 5, merchant: "Muji", category: "Shopping", amount: 42.00, date: "May 1", method: "UPI", icon: "🛍️" },
  { id: 6, merchant: "Sushi Hana", category: "Dining", amount: 28.50, date: "Apr 30", method: "Cash", icon: "🍣" },
];

export const meals = [
  { id: 1, name: "Greek Yogurt Bowl", time: "8:24 AM", cal: 320, p: 22, c: 38, f: 9, cost: 4.20 },
  { id: 2, name: "Chicken Caesar Wrap", time: "12:50 PM", cal: 540, p: 38, c: 45, f: 22, cost: 11.50 },
  { id: 3, name: "Iced Latte", time: "3:15 PM", cal: 120, p: 6, c: 14, f: 5, cost: 5.25 },
];
