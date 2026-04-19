package com.personalproject.tracker.dashboard;

import com.personalproject.tracker.dashboard.dto.CategorySpendSummary;
import com.personalproject.tracker.dashboard.dto.DashboardSummaryResponse;
import com.personalproject.tracker.expense.ExpenseRepository;
import com.personalproject.tracker.expense.dto.ExpenseResponse;
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

    public DashboardService(
            ProfileRepository profileRepository,
            ExpenseRepository expenseRepository,
            FoodLogRepository foodLogRepository
    ) {
        this.profileRepository = profileRepository;
        this.expenseRepository = expenseRepository;
        this.foodLogRepository = foodLogRepository;
    }

    public DashboardSummaryResponse getSummary(String userId, String month) {
        MonthRange range = DateRangeUtils.parseMonth(month);
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for userId: " + userId));

        List<com.personalproject.tracker.expense.Expense> expenses =
                expenseRepository.findByUserId(userId).stream()
                        .filter(expense -> !expense.getDate().isBefore(range.start()) && expense.getDate().isBefore(range.endExclusive()))
                        .sorted(Comparator.comparing(com.personalproject.tracker.expense.Expense::getDate).reversed()
                                .thenComparing(com.personalproject.tracker.expense.Expense::getCreatedAt).reversed())
                        .toList();
        List<com.personalproject.tracker.food.FoodLog> foodLogs =
                foodLogRepository.findByUserId(userId).stream()
                        .filter(log -> !log.getDate().isBefore(range.start()) && log.getDate().isBefore(range.endExclusive()))
                        .sorted(Comparator.comparing(com.personalproject.tracker.food.FoodLog::getDate).reversed()
                                .thenComparing(com.personalproject.tracker.food.FoodLog::getCreatedAt).reversed())
                        .toList();

        double totalSpent = expenses.stream().mapToDouble(com.personalproject.tracker.expense.Expense::getAmount).sum();
        double foodCost = foodLogs.stream().mapToDouble(com.personalproject.tracker.food.FoodLog::getEstimatedCost).sum();
        double caloriesToday = foodLogRepository.findByUserIdAndDate(userId, LocalDate.now())
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

        List<com.personalproject.tracker.dashboard.dto.DailySpendSummary> dailySpending = expenses.stream()
                .collect(Collectors.groupingBy(
                        com.personalproject.tracker.expense.Expense::getDate,
                        Collectors.summingDouble(com.personalproject.tracker.expense.Expense::getAmount)
                ))
                .entrySet().stream()
                .map(entry -> new com.personalproject.tracker.dashboard.dto.DailySpendSummary(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(com.personalproject.tracker.dashboard.dto.DailySpendSummary::date))
                .toList();

        double spentToday = expenseRepository.findByUserIdAndDate(userId, LocalDate.now())
                .stream()
                .mapToDouble(com.personalproject.tracker.expense.Expense::getAmount)
                .sum();

        // Calculate Streak
        java.util.Set<LocalDate> activeDates = new java.util.HashSet<>();
        expenseRepository.findByUserId(userId).forEach(e -> activeDates.add(e.getDate()));
        foodLogRepository.findByUserId(userId).forEach(f -> activeDates.add(f.getDate()));

        int streak = 0;
        LocalDate checkDate = LocalDate.now();
        
        // If nothing today, check if streak ended yesterday
        if (!activeDates.contains(checkDate)) {
            checkDate = checkDate.minusDays(1);
        }
        
        while (activeDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return new DashboardSummaryResponse(
                userId,
                profile.getMonthlyBudget(),
                totalSpent,
                profile.getMonthlyBudget() - totalSpent,
                profile.getCalorieGoal(),
                caloriesToday,
                categorySpending,
                recentTransactions,
                foodCost,
                dailySpending,
                streak,
                spentToday
        );
    }
}
