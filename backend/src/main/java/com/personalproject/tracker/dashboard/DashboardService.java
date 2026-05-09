package com.personalproject.tracker.dashboard;

import com.personalproject.tracker.dashboard.dto.CategorySpendSummary;
import com.personalproject.tracker.dashboard.dto.DashboardSummaryResponse;
import com.personalproject.tracker.dashboard.dto.SpendingSummary;
import com.personalproject.tracker.expense.ExpenseRepository;
import com.personalproject.tracker.expense.dto.ExpenseResponse;
import com.personalproject.tracker.finance.FinanceService;
import com.personalproject.tracker.food.FoodLogRepository;
import com.personalproject.tracker.profile.ProfileRepository;
import com.personalproject.tracker.profile.UserCategory;
import com.personalproject.tracker.profile.UserProfile;
import com.personalproject.tracker.shared.DateRangeUtils;
import com.personalproject.tracker.shared.MonthRange;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final ProfileRepository profileRepository;
    private final ExpenseRepository expenseRepository;
    private final FoodLogRepository foodLogRepository;
    private final FinanceService financeService;

    public DashboardService(
            ProfileRepository profileRepository,
            ExpenseRepository expenseRepository,
            FoodLogRepository foodLogRepository,
            FinanceService financeService
    ) {
        this.profileRepository = profileRepository;
        this.expenseRepository = expenseRepository;
        this.foodLogRepository = foodLogRepository;
        this.financeService = financeService;
    }

    public DashboardSummaryResponse getSummary(String userId, String month, String todayStr) {
        MonthRange range = DateRangeUtils.parseMonth(month);
        LocalDate today = todayStr != null ? DateRangeUtils.parseDate(todayStr) : LocalDate.now();
        
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProfile p = new UserProfile();
                    p.setUserId(userId);
                    p.setName("User");
                    p.setMonthlyBudget(5000.0);
                    p.setCalorieGoal(2000.0);
                    p.setCategories(new java.util.ArrayList<>());
                    return p;
                });

        double monthlyBudget = profile.getMonthlyBudget() != null ? profile.getMonthlyBudget() : 5000.0;
        double calorieGoal = profile.getCalorieGoal() != null ? profile.getCalorieGoal() : 2000.0;

        List<com.personalproject.tracker.expense.Expense> expenses =
                expenseRepository.findByUserIdAndDateGreaterThanEqualAndDateLessThan(userId, range.start(), range.endExclusive()).stream()
                        .sorted(Comparator.comparing(com.personalproject.tracker.expense.Expense::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(com.personalproject.tracker.expense.Expense::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                        .toList();
        List<com.personalproject.tracker.food.FoodLog> foodLogs =
                foodLogRepository.findByUserIdAndDateGreaterThanEqualAndDateLessThan(userId, range.start(), range.endExclusive()).stream()
                        .sorted(Comparator.comparing(com.personalproject.tracker.food.FoodLog::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(com.personalproject.tracker.food.FoodLog::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                        .toList();

        double totalSpent = expenses.stream().mapToDouble(com.personalproject.tracker.expense.Expense::getAmount).sum();
        double foodCost = foodLogs.stream().mapToDouble(com.personalproject.tracker.food.FoodLog::getEstimatedCost).sum();
        double caloriesToday = foodLogRepository.findByUserIdAndDate(userId, today)
                .stream()
                .mapToDouble(com.personalproject.tracker.food.FoodLog::getCalories)
                .sum();

        Map<String, Double> spentByCategory = expenses.stream().collect(Collectors.groupingBy(
                expense -> expense.getCategoryName().trim(),
                Collectors.summingDouble(com.personalproject.tracker.expense.Expense::getAmount)
        ));

        List<CategorySpendSummary> categorySpending = profile.getCategories().stream()
                .map(category -> {
                    double spent = spentByCategory.getOrDefault(category.name().trim(), 0.0);
                    double progress = category.budget() == 0 ? 0 : Math.min(100.0, (spent / category.budget()) * 100.0);
                    return new CategorySpendSummary(category.name(), category.budget(), spent, progress);
                })
                .sorted(Comparator.comparing(CategorySpendSummary::progress).reversed())
                .toList();

        List<ExpenseResponse> recentTransactions = expenses.stream()
                .limit(6)
                .map(expense -> new ExpenseResponse(
                        expense.getId(),
                        expense.getUserId(),
                        expense.getAmount(),
                        expense.getCategoryName(),
                        expense.getPaymentMethod(),
                        expense.getDate(),
                        expense.getNote(),
                        expense.isRecurring(),
                        expense.getCreatedAt()
                ))
                .toList();

        // For the 7-day spend chart
        LocalDate sevenDaysAgo = today.minusDays(6);
        List<com.personalproject.tracker.expense.Expense> sevenDayExpenses = 
                expenseRepository.findByUserIdAndDateGreaterThanEqualAndDateLessThan(userId, sevenDaysAgo, today.plusDays(1));

        Map<LocalDate, Double> sevenDaySpentMap = sevenDayExpenses.stream()
                .collect(Collectors.groupingBy(
                        com.personalproject.tracker.expense.Expense::getDate,
                        Collectors.summingDouble(com.personalproject.tracker.expense.Expense::getAmount)
                ));

        List<com.personalproject.tracker.dashboard.dto.DailySpendSummary> dailySpending = new java.util.ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = sevenDaysAgo.plusDays(i);
            dailySpending.add(new com.personalproject.tracker.dashboard.dto.DailySpendSummary(date, sevenDaySpentMap.getOrDefault(date, 0.0)));
        }

        double spentToday = expenseRepository.findByUserIdAndDate(userId, today)
                .stream()
                .mapToDouble(com.personalproject.tracker.expense.Expense::getAmount)
                .sum();

        // Calculate Streak
        java.util.Set<LocalDate> activeDates = new java.util.HashSet<>();
        expenseRepository.findByUserId(userId).forEach(e -> activeDates.add(e.getDate()));
        foodLogRepository.findByUserId(userId).forEach(f -> activeDates.add(f.getDate()));

        int streak = 0;
        LocalDate checkDate = today;
        
        // If nothing today, check if streak ended yesterday
        if (!activeDates.contains(checkDate)) {
            checkDate = checkDate.minusDays(1);
        }
        
        while (activeDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        FinanceService.FinanceSnapshot financeSnapshot = financeService.getFinanceSnapshot(userId, today);
        
        // Calculate Monthly Savings: (Daily Limit * Days Elapsed) - Total Spent So Far
        double monthlySavings = (financeSnapshot.dailyLimit() * today.getDayOfMonth()) - totalSpent;

        return new DashboardSummaryResponse(
                userId,
                monthlyBudget,
                totalSpent,
                monthlyBudget - totalSpent,
                calorieGoal,
                caloriesToday,
                categorySpending,
                recentTransactions,
                foodCost,
                dailySpending,
                streak,
                spentToday,
                monthlySavings,
                new SpendingSummary(
                        financeSnapshot.dailyLimit(),
                        financeSnapshot.buffer(),
                        financeSnapshot.savings(),
                        financeSnapshot.todaySpent(),
                        financeSnapshot.todayDifference(),
                        financeSnapshot.trackingStartDate(),
                        financeSnapshot.lastProcessedDate()
                )
        );
    }
}
