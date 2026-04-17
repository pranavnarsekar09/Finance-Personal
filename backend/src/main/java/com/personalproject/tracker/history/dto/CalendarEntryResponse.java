package com.personalproject.tracker.history.dto;

import com.personalproject.tracker.expense.dto.ExpenseResponse;
import com.personalproject.tracker.food.dto.FoodLogResponse;
import java.time.LocalDate;
import java.util.List;

public record CalendarEntryResponse(
        LocalDate date,
        boolean hasExpenses,
        boolean hasMeals,
        List<ExpenseResponse> expenses,
        List<FoodLogResponse> meals
) {
}
