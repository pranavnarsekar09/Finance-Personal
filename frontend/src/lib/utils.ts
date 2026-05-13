import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CoveredExpense } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRupees = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const INCOME_SOURCES_KEY = "fintrack:income-sources";

const DEFAULT_INCOME_SOURCES = [
  "Pocket Money",
  "Dad",
  "Mom",
  "Sold Something",
  "Cashback",
  "Other"
];

export function getIncomeSources(): string[] {
  if (typeof window === "undefined") return DEFAULT_INCOME_SOURCES;
  try {
    const stored = localStorage.getItem(INCOME_SOURCES_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_INCOME_SOURCES;
  } catch {
    return DEFAULT_INCOME_SOURCES;
  }
}

export function saveIncomeSources(sources: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INCOME_SOURCES_KEY, JSON.stringify(sources));
  } catch {
    // Ignore storage failures
  }
}

export function addIncomeSource(source: string): string[] {
  const current = getIncomeSources();
  if (current.includes(source)) return current;
  const updated = [...current, source];
  saveIncomeSources(updated);
  return updated;
}

export function removeIncomeSource(source: string): string[] {
  const current = getIncomeSources();
  const updated = current.filter((s) => s !== source);
  saveIncomeSources(updated);
  return updated;
}

const COVERED_EXPENSES_KEY = "fintrack:covered-expenses";
const COVERINGS_DASHBOARD_VISIBLE_KEY = "fintrack:coverings-dashboard-visible";

const DEFAULT_COVERED_EXPENSES = [
  { name: "Rent", suggestedAmount: 5000, suggestedWho: "Mom" },
  { name: "College Fees", suggestedAmount: 10000, suggestedWho: "Dad" },
  { name: "Tiffin", suggestedAmount: 2000, suggestedWho: "Mom" },
];

export function getDefaultCoveredExpenses() {
  return DEFAULT_COVERED_EXPENSES;
}

export function getCoveredExpenses(): CoveredExpense[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(COVERED_EXPENSES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCoveredExpenses(expenses: CoveredExpense[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COVERED_EXPENSES_KEY, JSON.stringify(expenses));
  } catch {
    // Ignore storage failures
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function addCoveredExpense(expense: Omit<CoveredExpense, "id" | "createdAt">): CoveredExpense[] {
  const current = getCoveredExpenses();
  const newExpense: CoveredExpense = {
    ...expense,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const updated = [...current, newExpense];
  saveCoveredExpenses(updated);
  return updated;
}

export function updateCoveredExpense(id: string, updates: Partial<CoveredExpense>): CoveredExpense[] {
  const current = getCoveredExpenses();
  const updated = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
  saveCoveredExpenses(updated);
  return updated;
}

export function deleteCoveredExpense(id: string): CoveredExpense[] {
  const current = getCoveredExpenses();
  const updated = current.filter((e) => e.id !== id);
  saveCoveredExpenses(updated);
  return updated;
}

export function getCoveringsMonthlyTotal(): number {
  const expenses = getCoveredExpenses();
  return expenses.reduce((total, expense) => {
    switch (expense.frequency) {
      case "monthly":
        return total + expense.amount;
      case "semester":
        return total + expense.amount / 6;
      case "yearly":
        return total + expense.amount / 12;
      default:
        return total + expense.amount;
    }
  }, 0);
}

export function isCoveringsDashboardVisible(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(COVERINGS_DASHBOARD_VISIBLE_KEY);
    return stored === null ? true : JSON.parse(stored);
  } catch {
    return true;
  }
}

export function setCoveringsDashboardVisible(visible: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COVERINGS_DASHBOARD_VISIBLE_KEY, JSON.stringify(visible));
  } catch {
    // Ignore storage failures
  }
}
