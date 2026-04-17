package com.personalproject.tracker.ai;

import com.personalproject.tracker.ai.dto.ChatRequest;
import com.personalproject.tracker.ai.dto.ChatResponse;
import com.personalproject.tracker.expense.Expense;
import com.personalproject.tracker.expense.ExpenseRepository;
import com.personalproject.tracker.food.FoodLog;
import com.personalproject.tracker.food.FoodLogRepository;
import com.personalproject.tracker.food.GeminiClient;
import com.personalproject.tracker.profile.UserProfile;
import com.personalproject.tracker.profile.ProfileRepository;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final ProfileRepository profileRepository;
    private final ExpenseRepository expenseRepository;
    private final FoodLogRepository foodLogRepository;
    private final GeminiClient geminiClient;

    public ChatService(ProfileRepository profileRepository, 
                       ExpenseRepository expenseRepository,
                       FoodLogRepository foodLogRepository,
                       GeminiClient geminiClient) {
        this.profileRepository = profileRepository;
        this.expenseRepository = expenseRepository;
        this.foodLogRepository = foodLogRepository;
        this.geminiClient = geminiClient;
    }

    public ChatResponse chat(String userId, ChatRequest request) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        YearMonth month = YearMonth.now();
        LocalDate start = month.atDay(1);
        LocalDate end = month.plusMonths(1).atDay(1);

        var expenses = expenseRepository.findByUserId(userId).stream()
                .filter(e -> !e.getDate().isBefore(start) && e.getDate().isBefore(end))
                .toList();

        double totalSpent = expenses.stream()
                .filter(e -> e.getAmount() != null)
                .mapToDouble(Expense::getAmount)
                .sum();
        String recentExpenses = expenses.stream()
                .limit(10)
                .map(e -> String.format("- %s: %.2f on %s", e.getCategoryName(), e.getAmount(), e.getDate()))
                .collect(Collectors.joining("\n"));

        var todayLogs = foodLogRepository.findByUserId(userId).stream()
                .filter(l -> l.getDate().equals(LocalDate.now()))
                .toList();
        
        double caloriesToday = todayLogs.stream()
                .filter(l -> l.getCalories() != null)
                .mapToDouble(FoodLog::getCalories)
                .sum();

        String prompt = String.format("""
                You are a helpful and friendly personal finance and nutrition assistant named FinTrack AI.
                The user's monthly budget is %.2f.
                They have spent %.2f so far this month.
                They have eaten %.2f calories today out of a goal of %.2f.
                
                Recent transactions:
                %s
                
                User question: %s
                
                Provide a helpful, encouraging, and concise answer. If they ask about spending, refer to their budget and recent transactions. If they ask about food, refer to their calorie intake.
                """, 
                profile.getMonthlyBudget(), 
                totalSpent, 
                caloriesToday, 
                profile.getCalorieGoal(),
                recentExpenses,
                request.message());

        String aiResponse = geminiClient.generateInsight(prompt);
        if (aiResponse == null || aiResponse.isBlank()) {
            aiResponse = "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment!";
        }

        return new ChatResponse(aiResponse);
    }
}
