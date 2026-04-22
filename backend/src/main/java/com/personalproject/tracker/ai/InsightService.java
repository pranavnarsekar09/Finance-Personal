package com.personalproject.tracker.ai;

import com.personalproject.tracker.ai.dto.InsightResponse;
import com.personalproject.tracker.expense.Expense;
import com.personalproject.tracker.expense.ExpenseRepository;
import com.personalproject.tracker.profile.ProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalproject.tracker.food.GeminiClient;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class InsightService {

    private final ProfileRepository profileRepository;
    private final ExpenseRepository expenseRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    
    // Simple cache to prevent redundant Gemini calls
    private final Map<String, InsightCacheEntry> insightCache = new ConcurrentHashMap<>();

    private record InsightCacheEntry(InsightResponse response, String cacheKey) {}

    public InsightService(ProfileRepository profileRepository, ExpenseRepository expenseRepository, GeminiClient geminiClient, ObjectMapper objectMapper) {
        this.profileRepository = profileRepository;
        this.expenseRepository = expenseRepository;
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

        double totalSpent = expenses.stream().mapToDouble(expense -> expense.getAmount()).sum();
        int dayOfMonth = Math.max(1, LocalDate.now().getDayOfMonth());
        double avgDailySpend = totalSpent / dayOfMonth;
        double remaining = Math.max(0, profile.getMonthlyBudget() - totalSpent);
        double runway = avgDailySpend == 0 ? remaining : remaining / avgDailySpend;

        Map<String, Double> byCategory = expenses.stream().collect(Collectors.groupingBy(
                (Expense expense) -> expense.getCategoryName().trim(),
                Collectors.summingDouble(Expense::getAmount)
        ));

        String topCategory = byCategory.entrySet().stream()
                .max(Comparator.comparing(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse("No category yet");

        // Create a cache key based on the data that influences the prompt
        String cacheKey = String.format("%.2f|%.2f|%.2f|%.2f|%.1f|%s", 
                profile.getMonthlyBudget(), totalSpent, remaining, avgDailySpend, runway, topCategory);

        InsightCacheEntry cached = insightCache.get(userId);
        if (cached != null && cached.cacheKey().equals(cacheKey)) {
            return cached.response();
        }

        String headline = "AI Insight";
        String summary = totalSpent > profile.getMonthlyBudget()
                ? "You have crossed your planned monthly budget. Tightening spend in your highest category could stabilize the month."
                : "You are tracking within budget so far. Your current pace suggests you can stretch the remaining budget for the rest of the month.";

        String prompt = """
                Act as a personal finance AI. I am a user tracking my monthly budget.
                My total monthly budget is %.2f.
                I have spent %.2f so far this month.
                My remaining budget is %.2f.
                My average daily spend so far is %.2f.
                Based on my current pace, my runway (how many days my remaining budget will last) is %.1f days.
                My top spending category is "%s".

                Provide a highly concise, 1-2 sentence friendly insight on my financial health this month.
                Return ONLY a valid JSON object with EXACTLY two fields:
                1. "headline": A very short, catchy title (2-4 words maximum, e.g. "Great Pace!", "Watch Out!", "Steady Spending").
                2. "summary": The 1-2 sentence friendly insight.
                No markdown, no extra text.
                """.formatted(profile.getMonthlyBudget(), totalSpent, remaining, avgDailySpend, runway, topCategory);

        try {
            String geminiResponse = geminiClient.generateInsight(prompt);
            if (StringUtils.hasText(geminiResponse)) {
                JsonNode json = objectMapper.readTree(geminiResponse);
                if (json.has("headline") && json.has("summary")) {
                    headline = json.path("headline").asText();
                    summary = json.path("summary").asText();
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch/parse Gemini insight: " + e.getMessage());
        }

        InsightResponse response = new InsightResponse(
                userId,
                headline,
                summary,
                runway,
                avgDailySpend,
                topCategory
        );
        
        // Cache the successful or fallback response
        insightCache.put(userId, new InsightCacheEntry(response, cacheKey));

        return response;
    }
}
