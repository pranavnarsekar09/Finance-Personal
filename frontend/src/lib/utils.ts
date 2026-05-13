import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
