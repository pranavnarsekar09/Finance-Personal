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
  Heart,
  Plus,
  CreditCard,
  TrendingDown,
  UtensilsCrossed,
  Archive
} from "lucide-react";

export type MainTabId = "dashboard" | "money" | "health" | "you";

export interface SubTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  queryParams?: Record<string, string>;
  description?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
}

export interface MainTabConfig {
  id: MainTabId;
  label: string;
  workspaceLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  subtabs: SubTab[];
  recentSubtabs?: string[];
  defaultSubtab: string;
  quickActions: QuickAction[];
}

export const NAVIGATION_CONFIG: Record<MainTabId, MainTabConfig> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    workspaceLabel: "Life Overview",
    icon: LayoutDashboard,
    defaultSubtab: "today",
    subtabs: [
      { id: "today", label: "Today", icon: LayoutDashboard, path: "/dashboard", queryParams: { tab: "today" }, description: "Daily summary" },
      { id: "insights", label: "Insights", icon: BarChart3, path: "/dashboard", queryParams: { tab: "insights" }, description: "AI behavioral analysis" },
      { id: "plan", label: "Plan", icon: Target, path: "/dashboard", queryParams: { tab: "plan" }, description: "Goals & budget" },
    ],
    recentSubtabs: ["today", "insights"],
    quickActions: [],
  },
  money: {
    id: "money",
    label: "Money",
    workspaceLabel: "Financial Hub",
    icon: Wallet,
    defaultSubtab: "overview",
    subtabs: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/money", queryParams: { tab: "overview" }, description: "Financial snapshot" },
      { id: "transactions", label: "Transactions", icon: Receipt, path: "/money", queryParams: { tab: "transactions" }, description: "18 entries this month" },
      { id: "income", label: "Income", icon: TrendingUp, path: "/money", queryParams: { tab: "income" }, description: "Income streams" },
      { id: "covered", label: "Covered", icon: Heart, path: "/money", queryParams: { tab: "covered" }, description: "Supported expenses" },
      { id: "calendar", label: "Calendar", icon: Calendar, path: "/money", queryParams: { tab: "calendar" }, description: "15 active days" },
    ],
    recentSubtabs: ["transactions", "calendar"],
    quickActions: [
      { id: "add-expense", label: "Add Expense", icon: CreditCard, action: "add-expense" },
      { id: "add-income", label: "Add Income", icon: TrendingUp, action: "add-income" },
    ],
  },
  health: {
    id: "health",
    label: "Health",
    workspaceLabel: "Wellness Center",
    icon: Apple,
    defaultSubtab: "today",
    subtabs: [
      { id: "today", label: "Today", icon: Utensils, path: "/health", queryParams: { tab: "today" }, description: "Today's nutrition" },
      { id: "week", label: "Week", icon: Activity, path: "/health", queryParams: { tab: "week" }, description: "Weekly trends" },
      { id: "history", label: "History", icon: Archive, path: "/health", queryParams: { tab: "history" }, description: "Past records" },
    ],
    recentSubtabs: ["today"],
    quickActions: [
      { id: "log-meal", label: "Log Meal", icon: UtensilsCrossed, action: "log-meal" },
    ],
  },
  you: {
    id: "you",
    label: "You",
    workspaceLabel: "Personal Space",
    icon: User,
    defaultSubtab: "profile",
    subtabs: [
      { id: "profile", label: "Profile", icon: User, path: "/you", queryParams: { tab: "profile" }, description: "Your details" },
      { id: "categories", label: "Categories", icon: Target, path: "/you", queryParams: { tab: "categories" }, description: "Spending categories" },
      { id: "preferences", label: "Preferences", icon: Settings, path: "/you", queryParams: { tab: "preferences" }, description: "App settings" },
      { id: "data", label: "Data", icon: FileText, path: "/you", queryParams: { tab: "data" }, description: "Export & backup" },
    ],
    recentSubtabs: ["profile"],
    quickActions: [],
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