export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
export const USER_ID = import.meta.env.VITE_USER_ID || "demo-user";

export const MOBILE_NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/finance", label: "Finance" },
  { to: "/food", label: "Food" },
  { to: "/calendar", label: "History" },
  { to: "/activity", label: "Activity" },
  { to: "/chat", label: "Chat" },
  { to: "/profile", label: "Profile" },
];
