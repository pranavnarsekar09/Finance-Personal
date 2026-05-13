package com.personalproject.tracker.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalproject.tracker.ai.dto.AiAnomaly;
import com.personalproject.tracker.ai.dto.AiDashboardResponse;
import com.personalproject.tracker.ai.dto.AiPrediction;
import com.personalproject.tracker.ai.dto.AiRecommendation;
import com.personalproject.tracker.ai.dto.AiScore;
import com.personalproject.tracker.ai.dto.InsightResponse;
import com.personalproject.tracker.coveredexpense.CoveredExpense;
import com.personalproject.tracker.coveredexpense.CoveredExpenseRepository;
import com.personalproject.tracker.expense.Expense;
import com.personalproject.tracker.expense.ExpenseRepository;
import com.personalproject.tracker.finance.UserFinanceRepository;
import com.personalproject.tracker.food.FoodLog;
import com.personalproject.tracker.food.FoodLogRepository;
import com.personalproject.tracker.food.GeminiClient;
import com.personalproject.tracker.goal.Goal;
import com.personalproject.tracker.goal.GoalRepository;
import com.personalproject.tracker.goal.GoalType;
import com.personalproject.tracker.profile.ProfileRepository;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class InsightService {

    private final ProfileRepository profileRepository;
    private final ExpenseRepository expenseRepository;
    private final FoodLogRepository foodLogRepository;
    private final GoalRepository goalRepository;
    private final UserFinanceRepository userFinanceRepository;
    private final CoveredExpenseRepository coveredExpenseRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    private final Map<String, InsightCacheEntry> insightCache = new ConcurrentHashMap<>();
    private final Map<String, AiDashboardCacheEntry> dashboardCache = new ConcurrentHashMap<>();

    private record InsightCacheEntry(InsightResponse response, String cacheKey) {}
    private record AiDashboardCacheEntry(AiDashboardResponse response, String cacheKey) {}

    public InsightService(
            ProfileRepository profileRepository,
            ExpenseRepository expenseRepository,
            FoodLogRepository foodLogRepository,
            GoalRepository goalRepository,
            UserFinanceRepository userFinanceRepository,
            CoveredExpenseRepository coveredExpenseRepository,
            GeminiClient geminiClient,
            ObjectMapper objectMapper
    ) {
        this.profileRepository = profileRepository;
        this.expenseRepository = expenseRepository;
        this.foodLogRepository = foodLogRepository;
        this.goalRepository = goalRepository;
        this.userFinanceRepository = userFinanceRepository;
        this.coveredExpenseRepository = coveredExpenseRepository;
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper;
    }

    public InsightResponse getInsight(String userId) {
        var profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for userId: " + userId));

        YearMonth month = YearMonth.now();
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        var expenses = expenseRepository.findByUserIdAndDateBetween(userId, start, end).stream()
                .sorted(Comparator.comparing(Expense::getDate).reversed().thenComparing(Expense::getCreatedAt).reversed())
                .toList();

        double totalSpent = expenses.stream().mapToDouble(expense -> safe(expense.getAmount())).sum();
        int dayOfMonth = Math.max(1, LocalDate.now().getDayOfMonth());
        double avgDailySpend = totalSpent / dayOfMonth;
        double remaining = Math.max(0, safe(profile.getMonthlyBudget()) - totalSpent);
        int daysInMonth = month.lengthOfMonth();
        int daysLeft = daysInMonth - dayOfMonth + 1;
        double runway = avgDailySpend == 0 ? daysLeft : Math.min(daysLeft * 2.0, remaining / avgDailySpend);

        Map<String, Double> byCategory = expenses.stream().collect(Collectors.groupingBy(
                (Expense expense) -> normalizeLabel(expense.getCategoryName(), "Other"),
                Collectors.summingDouble(expense -> safe(expense.getAmount()))
        ));

        String topCategory = byCategory.entrySet().stream()
                .max(Comparator.comparing(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse("No expenses yet");

        String cacheKey = String.format(
                Locale.US,
                "%s|%.2f|%.2f|%.2f|%.2f|%.1f|%s",
                month,
                safe(profile.getMonthlyBudget()),
                totalSpent,
                remaining,
                avgDailySpend,
                runway,
                topCategory
        );

        InsightCacheEntry cached = insightCache.get(userId);
        if (cached != null && cached.cacheKey().equals(cacheKey)) {
            return cached.response();
        }

        String headline = "AI Insight";
        String summary = totalSpent > safe(profile.getMonthlyBudget())
                ? "You've exceeded your monthly budget. Try cutting back on non-essentials immediately."
                : "Your spending is currently within the set budget, but keep an eye on your daily pace.";

        String prompt = """
                Act as a personal finance AI for an Indian user. All currency values are in INR.
                I am %s, tracking my monthly budget for %s %d.
                My total monthly budget is Rs %.2f.
                I have spent Rs %.2f so far this month.
                My remaining monthly budget is Rs %.2f.
                My actual available balance is Rs %.2f.
                My average daily spend so far is Rs %.2f.
                Based on my current pace, my money runway is estimated at %.1f days.
                My top spending category is "%s".

                Provide a highly concise, 1-2 sentence realistic and honest insight on my financial health.
                If my available balance or remaining budget is dangerously low, warn me clearly.

                Return ONLY a valid JSON object with EXACTLY two fields:
                "headline": a very short title.
                "summary": the insight.
                """.formatted(
                        profile.getName(),
                        month.getMonth().name(),
                        month.getYear(),
                        safe(profile.getMonthlyBudget()),
                        totalSpent,
                        remaining,
                        profile.getAvailableBalance() != null ? profile.getAvailableBalance() : remaining,
                        avgDailySpend,
                        runway,
                        topCategory
                );

        try {
            String geminiResponse = geminiClient.generateInsight(prompt);
            if (StringUtils.hasText(geminiResponse)) {
                JsonNode json = objectMapper.readTree(geminiResponse);
                if (json.has("headline") && json.has("summary")) {
                    headline = json.path("headline").asText(headline);
                    summary = json.path("summary").asText(summary);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch/parse Gemini insight: " + e.getMessage());
        }

        InsightResponse response = new InsightResponse(userId, headline, summary, runway, avgDailySpend, topCategory);
        insightCache.put(userId, new InsightCacheEntry(response, cacheKey));
        return response;
    }

    public AiDashboardResponse getDashboard(String userId) {
        var profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for userId: " + userId));

        LocalDate today = LocalDate.now();
        YearMonth month = YearMonth.from(today);
        LocalDate monthStart = month.atDay(1);
        LocalDate nextMonthStart = month.plusMonths(1).atDay(1);
        LocalDate windowStart = today.minusDays(29);
        LocalDate recentStart = today.minusDays(6);

        List<Expense> monthlyExpenses = expenseRepository.findByUserIdAndDateGreaterThanEqualAndDateLessThan(userId, monthStart, nextMonthStart);
        List<Expense> rollingExpenses = expenseRepository.findByUserIdAndDateGreaterThanEqualAndDateLessThan(userId, windowStart, nextMonthStart);
        List<FoodLog> rollingFoods = foodLogRepository.findByUserIdAndDateGreaterThanEqualAndDateLessThan(userId, windowStart, nextMonthStart);
        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        var finance = userFinanceRepository.findByUserId(userId).orElse(null);
        List<CoveredExpense> coveredExpenses = coveredExpenseRepository.findByUserId(userId);

        double monthlyCovered = coveredExpenses.stream()
                .filter(e -> "monthly".equalsIgnoreCase(e.getFrequency()))
                .mapToDouble(e -> safe(e.getAmount()))
                .sum();
        double semesterCovered = coveredExpenses.stream()
                .filter(e -> "semester".equalsIgnoreCase(e.getFrequency()))
                .mapToDouble(e -> safe(e.getAmount()))
                .sum();
        double yearlyCovered = coveredExpenses.stream()
                .filter(e -> "yearly".equalsIgnoreCase(e.getFrequency()))
                .mapToDouble(e -> safe(e.getAmount()))
                .sum();

        String coveredExpensesText = coveredExpenses.isEmpty()
                ? "No expenses are currently marked as covered by others."
                : String.format(
                        "Expenses covered by others: %s. Total covered monthly: Rs %.0f, Semester: Rs %.0f, Yearly: Rs %.0f.",
                        coveredExpenses.stream()
                                .map(e -> String.format("%s (Rs %.0f by %s)", e.getName(), safe(e.getAmount()), e.getWhoCovers()))
                                .collect(Collectors.joining("; ")),
                        monthlyCovered, semesterCovered, yearlyCovered
                );

        double totalCoveredEquivalentMonthly = monthlyCovered + (semesterCovered / 6.0) + (yearlyCovered / 12.0);

        double monthlyBudget = safe(profile.getMonthlyBudget());
        double totalSpent = monthlyExpenses.stream().mapToDouble(expense -> safe(expense.getAmount())).sum();
        double remainingBudget = Math.max(0, monthlyBudget - totalSpent);
        int currentDay = Math.max(1, today.getDayOfMonth());
        int daysLeftInMonth = Math.max(0, month.lengthOfMonth() - today.getDayOfMonth());
        double avgDailySpendThisMonth = totalSpent / currentDay;
        double estimatedDaysToBudgetEnd = avgDailySpendThisMonth <= 0 ? daysLeftInMonth : remainingBudget / avgDailySpendThisMonth;

        Map<String, Double> categoryTotals = monthlyExpenses.stream().collect(Collectors.groupingBy(
                expense -> normalizeLabel(expense.getCategoryName(), "Other"),
                Collectors.summingDouble(expense -> safe(expense.getAmount()))
        ));
        Map<String, Double> categoryAverages = rollingExpenses.stream().collect(Collectors.groupingBy(
                expense -> normalizeLabel(expense.getCategoryName(), "Other"),
                Collectors.averagingDouble(expense -> safe(expense.getAmount()))
        ));

        List<Expense> subscriptions = monthlyExpenses.stream()
                .filter(Expense::isRecurring)
                .toList();
        double monthlySubscriptionTotal = subscriptions.stream().mapToDouble(expense -> safe(expense.getAmount())).sum();
        List<String> topSubscriptionNames = subscriptions.stream()
                .sorted(Comparator.comparingDouble((Expense expense) -> safe(expense.getAmount())).reversed())
                .limit(3)
                .map(expense -> normalizeLabel(expense.getCategoryName(), "Subscription") + " " + formatAmount(safe(expense.getAmount())))
                .toList();

        double homeCookSavings = estimateCookAtHomeSavings(monthlyExpenses);
        Goal savingsGoal = goals.stream().filter(goal -> goal.getType() == GoalType.SAVINGS).findFirst().orElse(null);
        double suggestedEmergencyTransfer = Math.min(500.0, Math.max(0.0, remainingBudget * 0.12));

        List<DailyAmount> recentSpending = buildDailySpending(rollingExpenses, recentStart, today);
        List<DailyAmount> recentCalories = buildDailyCalories(rollingFoods, recentStart, today);

        double spendingAverage = recentSpending.stream().mapToDouble(DailyAmount::amount).average().orElse(0);
        double calorieAverage = recentCalories.stream().mapToDouble(DailyAmount::amount).average().orElse(0);
        int loggingDays = (int) recentCalories.stream().filter(day -> day.amount() > 0).count();
        int withinBudgetDays = (int) recentSpending.stream().filter(day -> {
            double limit = finance != null && finance.getDailyLimit() != null ? finance.getDailyLimit() : monthlyBudget / Math.max(1, month.lengthOfMonth());
            return day.amount() <= limit;
        }).count();

        int financialHealthScore = clampScore((int) Math.round(
                100
                        - Math.max(0, (totalSpent / Math.max(1.0, monthlyBudget) - 0.75) * 85)
                        - Math.max(0, monthlySubscriptionTotal / Math.max(1.0, monthlyBudget) * 30)
        ));
        int nutritionScore = clampScore((int) Math.round(
                (loggingDays / 7.0) * 45
                        + scoreAroundTarget(calorieAverage, safe(profile.getCalorieGoal())) * 0.35
                        + scoreAroundTarget(rollingFoods.stream().mapToDouble(food -> safe(food.getProtein())).average().orElse(0), 75) * 0.20
        ));
        int consistencyScore = clampScore((int) Math.round(
                (loggingDays / 7.0) * 50
                        + (withinBudgetDays / 7.0) * 35
                        + (savingsGoal != null ? Math.min(15, calculateSavingsProgress(savingsGoal) * 0.15) : 8)
        ));

        String financialTrend = trendForScore(financialHealthScore, 68, 82);
        String nutritionTrend = trendForScore(nutritionScore, 62, 80);
        String consistencyTrend = trendForScore(consistencyScore, 60, 78);

        double entertainmentSpike = findLargestCategorySpike(categoryTotals, categoryAverages);
        String entertainmentSpikeCategory = findLargestSpikeCategory(categoryTotals, categoryAverages);

        List<AiPrediction> fallbackPredictions = fallbackPredictions(
                estimatedDaysToBudgetEnd,
                savingsGoal,
                avgDailySpendThisMonth,
                monthlySubscriptionTotal
        );
        List<AiRecommendation> fallbackRecommendations = fallbackRecommendations(
                monthlySubscriptionTotal,
                topSubscriptionNames,
                homeCookSavings,
                suggestedEmergencyTransfer,
                savingsGoal
        );
        List<AiAnomaly> fallbackAnomalies = fallbackAnomalies(
                entertainmentSpikeCategory,
                entertainmentSpike,
                categoryAverages.getOrDefault(entertainmentSpikeCategory, 0.0),
                finance != null ? finance.getLastProcessedDate() : null,
                today,
                rollingExpenses.stream().mapToDouble(expense -> safe(expense.getAmount())).max().orElse(0)
        );
        List<AiScore> fallbackScores = fallbackScores(
                financialHealthScore,
                nutritionScore,
                consistencyScore,
                financialTrend,
                nutritionTrend,
                consistencyTrend,
                remainingBudget,
                monthlyBudget,
                calorieAverage,
                loggingDays,
                withinBudgetDays,
                savingsGoal
        );

        String cacheKey = String.format(
                Locale.US,
                "%s|%.2f|%.2f|%.2f|%.2f|%d|%d|%d|%d|%s",
                today,
                monthlyBudget,
                totalSpent,
                monthlySubscriptionTotal,
                homeCookSavings,
                rollingExpenses.size(),
                rollingFoods.size(),
                financialHealthScore,
                consistencyScore,
                savingsGoal != null ? savingsGoal.getDeadline() : "none"
        );

        AiDashboardCacheEntry cached = dashboardCache.get(userId);
        if (cached != null && cached.cacheKey().equals(cacheKey)) {
            return cached.response();
        }

        List<AiPrediction> predictions = fallbackPredictions;
        List<AiRecommendation> recommendations = fallbackRecommendations;
        List<AiAnomaly> anomalies = fallbackAnomalies;
        List<AiScore> scores = fallbackScores;

        String prompt = buildDashboardPrompt(
                profile.getName(),
                monthlyBudget,
                totalSpent,
                remainingBudget,
                estimatedDaysToBudgetEnd,
                avgDailySpendThisMonth,
                monthlySubscriptionTotal,
                homeCookSavings,
                suggestedEmergencyTransfer,
                savingsGoal,
                financialHealthScore,
                nutritionScore,
                consistencyScore,
                entertainmentSpikeCategory,
                entertainmentSpike,
                categoryAverages.getOrDefault(entertainmentSpikeCategory, 0.0),
                finance != null ? finance.getLastProcessedDate() : null,
                today,
                coveredExpensesText,
                totalCoveredEquivalentMonthly
        );

        try {
            String geminiResponse = geminiClient.generateInsight(prompt);
            if (StringUtils.hasText(geminiResponse)) {
                JsonNode root = objectMapper.readTree(geminiResponse);
                predictions = parsePredictions(root.path("predictions"), fallbackPredictions);
                recommendations = parseRecommendations(root.path("recommendations"), fallbackRecommendations);
                anomalies = parseAnomalies(root.path("anomalies"), fallbackAnomalies);
                scores = parseScores(root.path("scores"), fallbackScores);
            }
        } catch (Exception exception) {
            System.err.println("Failed to build AI dashboard from Gemini: " + exception.getMessage());
        }

        AiDashboardResponse response = new AiDashboardResponse(
                userId,
                today.toString(),
                predictions,
                recommendations,
                anomalies,
                scores
        );
        dashboardCache.put(userId, new AiDashboardCacheEntry(response, cacheKey));
        return response;
    }

    public void invalidateInsightCache(String userId) {
        insightCache.remove(userId);
        dashboardCache.remove(userId);
    }

    private String buildDashboardPrompt(
            String name,
            double monthlyBudget,
            double totalSpent,
            double remainingBudget,
            double estimatedDaysToBudgetEnd,
            double avgDailySpend,
            double monthlySubscriptionTotal,
            double homeCookSavings,
            double suggestedEmergencyTransfer,
            Goal savingsGoal,
            int financialHealthScore,
            int nutritionScore,
            int consistencyScore,
            String spikeCategory,
            double spikeAmount,
            double spikeAverage,
            LocalDate lastIncomeDate,
            LocalDate today,
            String coveredExpensesText,
            double totalCoveredEquivalentMonthly
    ) {
        String savingsText = savingsGoal == null
                ? "No active savings goal."
                : String.format(
                        Locale.US,
                        "Savings goal current %.2f target %.2f deadline %s progress %.1f percent.",
                        safe(savingsGoal.getCurrentAmount()),
                        safe(savingsGoal.getTargetAmount()),
                        savingsGoal.getDeadline(),
                        calculateSavingsProgress(savingsGoal)
                );

        return """
                You are generating content for a mobile AI dashboard in an Indian personal finance and health app.
                User name: %s
                All currency values are INR.

                Metrics:
                Monthly budget: %.2f
                Total spent this month: %.2f
                Remaining budget: %.2f
                Estimated budget exhaustion in days: %.1f
                Average daily spend this month: %.2f
                Monthly recurring/subscription spend: %.2f
                Estimated savings from cooking at home twice per week: %.2f
                Suggested emergency fund transfer this week: %.2f
                %s
                Financial health score: %d
                Nutrition score: %d
                Consistency score: %d
                Largest category spike: %s at %.2f versus average %.2f
                Most recent processed income/buffer date: %s
                %s
                Equivalent monthly value covered by others: Rs %.2f
                Today: %s

                Return ONLY valid JSON with keys:
                predictions: array of exactly 3 objects with title, detail, tone
                recommendations: array of exactly 3 objects with title, detail, impact, breakdown
                anomalies: array of exactly 3 objects with title, detail, severity
                scores: array of exactly 3 objects with name, value, trend, explanation, breakdown

                Constraints:
                Keep titles short and app-friendly.
                Use realistic, concrete language.
                Recommendation breakdown must be 2-4 short bullet strings.
                Score names must be exactly: Financial Health Score, Nutrition Score, Consistency Score.
                Score values must match the provided values exactly.
                Trend must be one of: up, down, flat.
                Do not use markdown fences.
                """.formatted(
                name,
                monthlyBudget,
                totalSpent,
                remainingBudget,
                estimatedDaysToBudgetEnd,
                avgDailySpend,
                monthlySubscriptionTotal,
                homeCookSavings,
                suggestedEmergencyTransfer,
                savingsText,
                financialHealthScore,
                nutritionScore,
                consistencyScore,
                spikeCategory,
                spikeAmount,
                spikeAverage,
                lastIncomeDate != null ? lastIncomeDate : "none",
                coveredExpensesText,
                totalCoveredEquivalentMonthly,
                today
        );
    }

    private List<AiPrediction> parsePredictions(JsonNode node, List<AiPrediction> fallback) {
        if (!node.isArray() || node.isEmpty()) {
            return fallback;
        }
        List<AiPrediction> items = new ArrayList<>();
        for (JsonNode child : node) {
            String title = child.path("title").asText();
            String detail = child.path("detail").asText();
            String tone = child.path("tone").asText("neutral");
            if (StringUtils.hasText(title) && StringUtils.hasText(detail)) {
                items.add(new AiPrediction(title, detail, tone));
            }
        }
        return items.isEmpty() ? fallback : items.stream().limit(3).toList();
    }

    private List<AiRecommendation> parseRecommendations(JsonNode node, List<AiRecommendation> fallback) {
        if (!node.isArray() || node.isEmpty()) {
            return fallback;
        }
        List<AiRecommendation> items = new ArrayList<>();
        for (JsonNode child : node) {
            String title = child.path("title").asText();
            String detail = child.path("detail").asText();
            String impact = child.path("impact").asText();
            List<String> breakdown = readStringList(child.path("breakdown"));
            if (StringUtils.hasText(title) && StringUtils.hasText(detail)) {
                items.add(new AiRecommendation(title, detail, impact, breakdown));
            }
        }
        return items.isEmpty() ? fallback : items.stream().limit(3).toList();
    }

    private List<AiAnomaly> parseAnomalies(JsonNode node, List<AiAnomaly> fallback) {
        if (!node.isArray() || node.isEmpty()) {
            return fallback;
        }
        List<AiAnomaly> items = new ArrayList<>();
        for (JsonNode child : node) {
            String title = child.path("title").asText();
            String detail = child.path("detail").asText();
            String severity = child.path("severity").asText("medium");
            if (StringUtils.hasText(title) && StringUtils.hasText(detail)) {
                items.add(new AiAnomaly(title, detail, severity));
            }
        }
        return items.isEmpty() ? fallback : items.stream().limit(3).toList();
    }

    private List<AiScore> parseScores(JsonNode node, List<AiScore> fallback) {
        if (!node.isArray() || node.isEmpty()) {
            return fallback;
        }
        List<AiScore> items = new ArrayList<>();
        for (JsonNode child : node) {
            String name = child.path("name").asText();
            int value = child.path("value").asInt(-1);
            String trend = child.path("trend").asText("flat");
            String explanation = child.path("explanation").asText();
            List<String> breakdown = readStringList(child.path("breakdown"));
            if (breakdown.isEmpty()) {
                breakdown = fallback.stream()
                        .filter(score -> score.name().equals(name))
                        .findFirst()
                        .map(AiScore::breakdown)
                        .orElse(List.of());
            }
            if (StringUtils.hasText(name) && value >= 0 && StringUtils.hasText(explanation)) {
                items.add(new AiScore(name, value, trend, explanation, breakdown));
            }
        }
        return items.isEmpty() ? fallback : items.stream().limit(3).toList();
    }

    private List<String> readStringList(JsonNode node) {
        if (!node.isArray()) {
            return List.of();
        }
        List<String> items = new ArrayList<>();
        for (JsonNode child : node) {
            if (child.isTextual() && StringUtils.hasText(child.asText())) {
                items.add(child.asText());
            }
        }
        return items;
    }

    private List<AiPrediction> fallbackPredictions(
            double estimatedDaysToBudgetEnd,
            Goal savingsGoal,
            double avgDailySpendThisMonth,
            double monthlySubscriptionTotal
    ) {
        String budgetPrediction = estimatedDaysToBudgetEnd < 7
                ? "You may exceed your budget in %d days.".formatted(Math.max(1, (int) Math.ceil(estimatedDaysToBudgetEnd)))
                : "At your current pace, this month's budget should hold for about %d more days.".formatted(Math.max(1, (int) Math.ceil(estimatedDaysToBudgetEnd)));

        String savingsPrediction = "No active savings goal right now.";
        if (savingsGoal != null && savingsGoal.getDeadline() != null) {
            double needed = Math.max(0, safe(savingsGoal.getTargetAmount()) - safe(savingsGoal.getCurrentAmount()));
            long weeksRemaining = Math.max(1, ChronoUnit.WEEKS.between(LocalDate.now(), savingsGoal.getDeadline()) + 1);
            double weeklyNeed = needed / weeksRemaining;
            savingsPrediction = weeklyNeed <= Math.max(500, avgDailySpendThisMonth * 2)
                    ? "Your savings goal looks achievable by %s at the current rate.".formatted(savingsGoal.getDeadline().getMonth())
                    : "Your savings goal needs roughly %s per week to stay on track.".formatted(formatAmount(weeklyNeed));
        }

        String subscriptionPrediction = monthlySubscriptionTotal > 0
                ? "Subscription costs are likely to roll into next month at %s if nothing changes.".formatted(formatAmount(monthlySubscriptionTotal))
                : "Recurring costs are light right now, so next month starts with less pressure.";

        return List.of(
                new AiPrediction("Budget runway", budgetPrediction, estimatedDaysToBudgetEnd < 7 ? "warning" : "neutral"),
                new AiPrediction("Savings outlook", savingsPrediction, savingsGoal != null ? "positive" : "neutral"),
                new AiPrediction("Recurring costs", subscriptionPrediction, monthlySubscriptionTotal > 0 ? "warning" : "positive")
        );
    }

    private List<AiRecommendation> fallbackRecommendations(
            double monthlySubscriptionTotal,
            List<String> topSubscriptionNames,
            double homeCookSavings,
            double suggestedEmergencyTransfer,
            Goal savingsGoal
    ) {
        List<String> subscriptionBreakdown = topSubscriptionNames.isEmpty()
                ? List.of("No recurring subscriptions were detected this month.", "Review bills and streaming renewals before month-end.")
                : new ArrayList<>(topSubscriptionNames);

        List<String> cookBreakdown = List.of(
                "Replacing two delivery meals a week lowers dining burn.",
                "Even small swaps compound into steadier monthly cash flow.",
                "Food logs suggest home meals also support more consistent nutrition."
        );

        String emergencyTitle = suggestedEmergencyTransfer > 0
                ? "Move " + formatAmount(suggestedEmergencyTransfer) + " to emergency fund this week"
                : "Pause extra transfers this week";
        List<String> emergencyBreakdown = savingsGoal != null
                ? List.of(
                        "Small weekly transfers reduce pressure near the deadline.",
                        "Your active savings goal benefits more from consistency than one big deposit.",
                        "Use any under-budget day to top this up."
                )
                : List.of(
                        "A small transfer builds cushion without derailing the week.",
                        "Treat buffer growth as a recurring habit, not a one-time event."
                );

        return List.of(
                new AiRecommendation(
                        "Reduce subscriptions to save " + formatAmount(monthlySubscriptionTotal) + "/month",
                        "A few recurring charges are quietly eating into your flexibility.",
                        monthlySubscriptionTotal > 0 ? "Tap to review the biggest recurring costs." : "Tap to review bills and recurring items.",
                        subscriptionBreakdown
                ),
                new AiRecommendation(
                        "Cook at home 2x per week to save " + formatAmount(homeCookSavings),
                        "Your dining pattern suggests a couple of home-cooked swaps would materially help.",
                        "Tap for the tradeoff behind the estimate.",
                        cookBreakdown
                ),
                new AiRecommendation(
                        emergencyTitle,
                        "A modest transfer this week keeps your buffer moving in the right direction.",
                        "Tap for the weekly logic behind this move.",
                        emergencyBreakdown
                )
        );
    }

    private List<AiAnomaly> fallbackAnomalies(
            String spikeCategory,
            double spikeAmount,
            double spikeAverage,
            LocalDate lastIncomeDate,
            LocalDate today,
            double largestExpense
    ) {
        String spikeTitle = "Unusual spending spike detected";
        String spikeDetail = "%s spend reached %s versus an average of %s.".formatted(
                spikeCategory,
                formatAmount(spikeAmount),
                formatAmount(spikeAverage)
        );

        String incomeDetail = lastIncomeDate != null && ChronoUnit.DAYS.between(lastIncomeDate, today) > 7
                ? "No recent buffer or savings processing has happened since %s.".formatted(lastIncomeDate)
                : "Recurring income looks on time for now, but keep an eye on the next cycle.";

        String largeExpenseDetail = largestExpense > 0
                ? "A one-time expense of %s stands out clearly from recent activity.".formatted(formatAmount(largestExpense))
                : "No major one-time expense was detected in the recent window.";

        return List.of(
                new AiAnomaly(spikeTitle, spikeDetail, spikeAmount > spikeAverage * 1.5 ? "high" : "medium"),
                new AiAnomaly("Missed recurring income alert", incomeDetail, lastIncomeDate != null && ChronoUnit.DAYS.between(lastIncomeDate, today) > 7 ? "medium" : "low"),
                new AiAnomaly("Large one-time expense flag", largeExpenseDetail, largestExpense > Math.max(1000, spikeAverage * 2) ? "high" : "medium")
        );
    }

    private List<AiScore> fallbackScores(
            int financialHealthScore,
            int nutritionScore,
            int consistencyScore,
            String financialTrend,
            String nutritionTrend,
            String consistencyTrend,
            double remainingBudget,
            double monthlyBudget,
            double calorieAverage,
            int loggingDays,
            int withinBudgetDays,
            Goal savingsGoal
    ) {
        return List.of(
                new AiScore(
                        "Financial Health Score",
                        financialHealthScore,
                        financialTrend,
                        "This score reflects how much room you still have in the month and how steady your spending looks.",
                        List.of(
                                "Remaining budget: " + formatAmount(remainingBudget) + " of " + formatAmount(monthlyBudget),
                                "Recurring bills are weighted because they reduce flexibility.",
                                "High category spikes pull the score down fastest."
                        )
                ),
                new AiScore(
                        "Nutrition Score",
                        nutritionScore,
                        nutritionTrend,
                        "This score rewards regular meal logging and calorie patterns that stay near your target.",
                        List.of(
                                "Meal logging days this week: " + loggingDays + "/7",
                                "Average calorie intake is tracking around " + Math.round(calorieAverage) + " kcal",
                                "Protein consistency helps stabilize the score."
                        )
                ),
                new AiScore(
                        "Consistency Score",
                        consistencyScore,
                        consistencyTrend,
                        "This score measures whether you keep showing up for both logging and budget control.",
                        List.of(
                                "Days within budget this week: " + withinBudgetDays + "/7",
                                "Nutrition logging streak matters as much as raw totals.",
                                savingsGoal != null
                                        ? "Savings goal progress is contributing to the habit score."
                                        : "Adding a savings target would strengthen this score."
                        )
                )
        );
    }

    private List<DailyAmount> buildDailySpending(List<Expense> expenses, LocalDate start, LocalDate end) {
        Map<LocalDate, Double> totals = expenses.stream().collect(Collectors.groupingBy(
                Expense::getDate,
                Collectors.summingDouble(expense -> safe(expense.getAmount()))
        ));
        return buildDailySeries(start, end, totals);
    }

    private List<DailyAmount> buildDailyCalories(List<FoodLog> foods, LocalDate start, LocalDate end) {
        Map<LocalDate, Double> totals = foods.stream().collect(Collectors.groupingBy(
                FoodLog::getDate,
                Collectors.summingDouble(food -> safe(food.getCalories()))
        ));
        return buildDailySeries(start, end, totals);
    }

    private List<DailyAmount> buildDailySeries(LocalDate start, LocalDate end, Map<LocalDate, Double> totals) {
        List<DailyAmount> result = new ArrayList<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            result.add(new DailyAmount(cursor, totals.getOrDefault(cursor, 0.0)));
            cursor = cursor.plusDays(1);
        }
        return result;
    }

    private double estimateCookAtHomeSavings(List<Expense> monthlyExpenses) {
        double diningSpent = monthlyExpenses.stream()
                .filter(expense -> normalizeLabel(expense.getCategoryName(), "").equalsIgnoreCase("Dining"))
                .mapToDouble(expense -> safe(expense.getAmount()))
                .sum();
        if (diningSpent <= 0) {
            return 3000.0;
        }
        return Math.max(800.0, Math.round((diningSpent * 0.35) / 100.0) * 100.0);
    }

    private double findLargestCategorySpike(Map<String, Double> categoryTotals, Map<String, Double> categoryAverages) {
        return categoryTotals.entrySet().stream()
                .mapToDouble(entry -> {
                    double average = categoryAverages.getOrDefault(entry.getKey(), 0.0);
                    return average <= 0 ? entry.getValue() : entry.getValue() - average;
                })
                .max()
                .orElse(0.0);
    }

    private String findLargestSpikeCategory(Map<String, Double> categoryTotals, Map<String, Double> categoryAverages) {
        return categoryTotals.entrySet().stream()
                .max(Comparator.comparingDouble(entry -> {
                    double average = categoryAverages.getOrDefault(entry.getKey(), 0.0);
                    return average <= 0 ? entry.getValue() : entry.getValue() - average;
                }))
                .map(Map.Entry::getKey)
                .orElse("General");
    }

    private double calculateSavingsProgress(Goal goal) {
        double target = Math.max(1.0, safe(goal.getTargetAmount()));
        return Math.min(100.0, (safe(goal.getCurrentAmount()) / target) * 100.0);
    }

    private double scoreAroundTarget(double actual, double target) {
        if (target <= 0) {
            return 50;
        }
        double delta = Math.abs(actual - target) / target;
        return clampScore((int) Math.round(100 - (delta * 100)));
    }

    private int clampScore(int value) {
        return Math.max(0, Math.min(100, value));
    }

    private String trendForScore(int value, int downThreshold, int upThreshold) {
        if (value >= upThreshold) {
            return "up";
        }
        if (value <= downThreshold) {
            return "down";
        }
        return "flat";
    }

    private String normalizeLabel(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }

    private double safe(Double value) {
        return value == null ? 0.0 : value;
    }

    private String formatAmount(double amount) {
        return "₹" + Math.round(amount);
    }

    private record DailyAmount(LocalDate date, double amount) {
    }
}
