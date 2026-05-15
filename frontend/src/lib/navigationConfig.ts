import { 
  LayoutDashboard, 
  Wallet, 
  Apple, 
  User,
  Receipt,
  TrendingUp,
  PiggyBank,
  Calendar,
  BarChart3,
  Target,
  Utensils,
  Activity,
  FileText,
  Settings,
  Heart
} from "lucide-react";

export type MainTabId = "dashboard" | "money" | "health" | "you";

export interface SubTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  path: string;
  queryParams?: Record<string, string>;
  defaultSubtab?: string;
}

export interface MainTabConfig {
  id: MainTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subtabs: SubTab[];
  recentSubtabs?: string[];
  defaultSubtab: string;
}

export const NAVIGATION_CONFIG: Record<MainTabId, MainTabConfig> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    defaultSubtab: "today",
    subtabs: [
      { id: "today", label: "Today", path: "/dashboard", queryParams: { tab: "today" } },
      { id: "insights", label: "Insights", path: "/dashboard", queryParams: { tab: "insights" } },
      { id: "plan", label: "Plan", path: "/dashboard", queryParams: { tab: "plan" } },
    ],
    recentSubtabs: ["today", "insights"],
  },
  money: {
    id: "money",
    label: "Money",
    icon: Wallet,
    defaultSubtab: "overview",
    subtabs: [
      { id: "overview", label: "Overview", path: "/money", queryParams: { tab: "overview" } },
      { id: "transactions", label: "Transactions", path: "/money", queryParams: { tab: "transactions" } },
      { id: "income", label: "Income", path: "/money", queryParams: { tab: "income" } },
      { id: "covered", label: "Covered", path: "/money", queryParams: { tab: "covered" } },
      { id: "calendar", label: "Calendar", path: "/money", queryParams: { tab: "calendar" } },
    ],
    recentSubtabs: ["transactions", "calendar"],
  },
  health: {
    id: "health",
    label: "Health",
    icon: Apple,
    defaultSubtab: "today",
    subtabs: [
      { id: "today", label: "Today", path: "/health", queryParams: { tab: "today" } },
      { id: "week", label: "Week", path: "/health", queryParams: { tab: "week" } },
      { id: "history", label: "History", path: "/health", queryParams: { tab: "history" } },
    ],
    recentSubtabs: ["today"],
  },
  you: {
    id: "you",
    label: "You",
    icon: User,
    defaultSubtab: "profile",
    subtabs: [
      { id: "profile", label: "Profile", path: "/you", queryParams: { tab: "profile" } },
      { id: "categories", label: "Categories", path: "/you", queryParams: { tab: "categories" } },
      { id: "preferences", label: "Preferences", path: "/you", queryParams: { tab: "preferences" } },
      { id: "data", label: "Data", path: "/you", queryParams: { tab: "data" } },
    ],
    recentSubtabs: ["profile"],
  },
};

export function getMainTabByPath(path: string): MainTabId {
  const pathMap: Record<string, MainTabId> = {
    "/dashboard": "dashboard",
    "/money": "money",
    "/health": "health",
    "/you": "you",
  };
  return pathMap[path] || "dashboard";
}

export function getSubtabsForTab(tabId: MainTabId): SubTab[] {
  return NAVIGATION_CONFIG[tabId]?.subtabs || [];
}

export function getRecentSubtabs(tabId: MainTabId): SubTab[] {
  const config = NAVIGATION_CONFIG[tabId];
  if (!config?.recentSubtabs) return [];
  return config.recentSubtabs.map(id => config.subtabs.find(s => s.id === id)).filter(Boolean) as SubTab[];
}