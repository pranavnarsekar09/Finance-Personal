package com.personalproject.tracker.dashboard.dto;

import com.personalproject.tracker.expense.dto.ExpenseResponse;
import java.util.List;

public record DashboardSummaryResponse(
        String userId,
        Double monthlyBudget,
        Double totalSpent,
        Double remainingBudget,
        Double calorieGoal,
        Double caloriesToday,
        List<CategorySpendSummary> categorySpending,
        List<ExpenseResponse> recentTransactions,
        Double monthlyFoodCost
) {
}
