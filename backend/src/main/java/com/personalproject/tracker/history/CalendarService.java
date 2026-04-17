package com.personalproject.tracker.history;

import com.personalproject.tracker.expense.ExpenseService;
import com.personalproject.tracker.expense.dto.ExpenseResponse;
import com.personalproject.tracker.food.FoodService;
import com.personalproject.tracker.food.dto.FoodLogResponse;
import com.personalproject.tracker.history.dto.CalendarEntryResponse;
import com.personalproject.tracker.shared.DateRangeUtils;
import com.personalproject.tracker.shared.MonthRange;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CalendarService {

    private final ExpenseService expenseService;
    private final FoodService foodService;

    public CalendarService(ExpenseService expenseService, FoodService foodService) {
        this.expenseService = expenseService;
        this.foodService = foodService;
    }

    public List<CalendarEntryResponse> getCalendar(String userId, String month) {
        MonthRange range = DateRangeUtils.parseMonth(month);
        List<ExpenseResponse> expenses = expenseService.getExpenses(userId, month);
        List<FoodLogResponse> meals = foodService.getLogs(userId, month);

        Map<LocalDate, CalendarEntryResponse> calendar = new LinkedHashMap<>();
        for (LocalDate date = range.start(); date.isBefore(range.endExclusive()); date = date.plusDays(1)) {
            calendar.put(date, new CalendarEntryResponse(date, false, false, List.of(), List.of()));
        }

        for (LocalDate date : calendar.keySet()) {
            List<ExpenseResponse> expenseList = expenses.stream().filter(entry -> entry.date().equals(date)).toList();
            List<FoodLogResponse> mealList = meals.stream().filter(entry -> entry.date().equals(date)).toList();
            calendar.put(date, new CalendarEntryResponse(
                    date,
                    !expenseList.isEmpty(),
                    !mealList.isEmpty(),
                    expenseList,
                    mealList
            ));
        }

        return calendar.values().stream().toList();
    }

    public void deleteExpensesByDate(String userId, String date) {
        expenseService.deleteExpensesByDate(userId, DateRangeUtils.parseDate(date));
    }

    public void deleteMealsByDate(String userId, String date) {
        foodService.deleteMealsByDate(userId, DateRangeUtils.parseDate(date));
    }
}
