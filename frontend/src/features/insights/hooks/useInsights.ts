import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDashboard, useFinance, useCoveredExpenses, useGoals } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { format, subMonths } from "date-fns";
import { generateInsightsData } from "../utils/calculations";
import type { InsightsData } from "../types";

function useExpensesByMonth(month: string) {
  return useQuery({
    queryKey: ["expenses", DEFAULT_USER_ID, month],
    queryFn: () => api.getExpenses(DEFAULT_USER_ID, month),
    staleTime: 60 * 1000,
  });
}

function useFoodLogsByMonth(month: string) {
  return useQuery({
    queryKey: ["foodLogs", DEFAULT_USER_ID, month],
    queryFn: () => api.getFoodLogs(DEFAULT_USER_ID, month),
    staleTime: 60 * 1000,
  });
}

export function useInsightsData(): {
  data: InsightsData | null;
  isLoading: boolean;
  isError: boolean;
} {
  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const today = format(now, "yyyy-MM-dd");

  const dashboardQuery = useDashboard(undefined, currentMonth, today);
  const financeQuery = useFinance(undefined, today);
  const goalsQuery = useGoals();
  const coveredExpensesQuery = useCoveredExpenses();

  const expenseQueries = useExpensesByMonth(currentMonth);
  const foodLogQueries = useFoodLogsByMonth(currentMonth);

  const isLoading = 
    dashboardQuery.isLoading || 
    financeQuery.isLoading || 
    goalsQuery.isLoading || 
    coveredExpensesQuery.isLoading ||
    expenseQueries.isLoading ||
    foodLogQueries.isLoading;

  const isError = 
    dashboardQuery.isError || 
    financeQuery.isError || 
    goalsQuery.isError || 
    coveredExpensesQuery.isError ||
    expenseQueries.isError ||
    foodLogQueries.isError;

  const data = useMemo(() => {
    if (isLoading || isError) return null;

    const dashboard = dashboardQuery.data;
    const finance = financeQuery.data;
    const goals = goalsQuery.data || [];
    const coveredExpenses = coveredExpensesQuery.data || [];
    const expenses = expenseQueries.data || [];
    const meals = foodLogQueries.data || [];

    return generateInsightsData(
      dashboard,
      finance,
      expenses,
      meals,
      coveredExpenses,
      goals
    );
  }, [
    dashboardQuery.data,
    financeQuery.data,
    goalsQuery.data,
    coveredExpensesQuery.data,
    expenseQueries.data,
    foodLogQueries.data,
    isLoading,
    isError
  ]);

  return { data, isLoading, isError };
}