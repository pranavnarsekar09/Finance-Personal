package com.personalproject.tracker.food;

import com.personalproject.tracker.expense.ExpenseService;
import com.personalproject.tracker.common.ResourceNotFoundException;
import com.personalproject.tracker.expense.PaymentMethod;
import com.personalproject.tracker.food.dto.AnalyzeFoodRequest;
import com.personalproject.tracker.food.dto.CreateFoodLogRequest;
import com.personalproject.tracker.food.dto.FoodAnalysisResponse;
import com.personalproject.tracker.food.dto.FoodLogResponse;
import com.personalproject.tracker.profile.ProfileRepository;
import com.personalproject.tracker.profile.UserProfile;
import com.personalproject.tracker.shared.DateRangeUtils;
import com.personalproject.tracker.shared.MonthRange;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Comparator;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class FoodService {

    private final FoodLogRepository foodLogRepository;
    private final ProfileRepository profileRepository;
    private final GeminiClient geminiClient;
    private final ExpenseService expenseService;

    public FoodService(
            FoodLogRepository foodLogRepository,
            ProfileRepository profileRepository,
            GeminiClient geminiClient,
            ExpenseService expenseService
    ) {
        this.foodLogRepository = foodLogRepository;
        this.profileRepository = profileRepository;
        this.geminiClient = geminiClient;
        this.expenseService = expenseService;
    }

    public FoodAnalysisResponse analyze(AnalyzeFoodRequest request) {
        return geminiClient.analyze(request);
    }

    public FoodLogResponse createFoodLog(CreateFoodLogRequest request) {
        FoodLog log = new FoodLog();
        applyFoodRequest(log, request);
        log.setCreatedAt(Instant.now());

        FoodLog saved = syncFoodLogWithExpense(log, request);
        return toResponse(saved);
    }

    public FoodLogResponse updateFoodLog(String id, CreateFoodLogRequest request) {
        FoodLog log = foodLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food log not found for id: " + id));
        applyFoodRequest(log, request);
        FoodLog saved = syncFoodLogWithExpense(log, request);
        return toResponse(saved);
    }

    private FoodLog syncFoodLogWithExpense(FoodLog log, CreateFoodLogRequest request) {
        String linkedCategory = resolveExpenseCategory(request.userId(), request.expenseCategoryName()).orElse(null);

        if (StringUtils.hasText(log.getLinkedExpenseId()) && !StringUtils.hasText(linkedCategory)) {
            expenseService.deleteExpense(log.getLinkedExpenseId());
            log.setLinkedExpenseId(null);
        } else if (StringUtils.hasText(log.getLinkedExpenseId()) && StringUtils.hasText(linkedCategory)) {
            expenseService.updateExpense(log.getLinkedExpenseId(), new com.personalproject.tracker.expense.dto.CreateExpenseRequest(
                    request.userId(),
                    request.estimatedCost(),
                    linkedCategory,
                    PaymentMethod.UPI,
                    request.date(),
                    "Auto-added from meal log: " + request.foodName(),
                    false
            ));
        } else if (!StringUtils.hasText(log.getLinkedExpenseId()) && StringUtils.hasText(linkedCategory)) {
            var createdExpense = expenseService.addDerivedExpense(
                    request.userId(),
                    request.estimatedCost(),
                    linkedCategory,
                    PaymentMethod.UPI,
                    request.date(),
                    "Auto-added from meal log: " + request.foodName()
            );
            log.setLinkedExpenseId(createdExpense.id());
        }

        return foodLogRepository.save(log);
    }

    private void applyFoodRequest(FoodLog log, CreateFoodLogRequest request) {
        log.setUserId(requireUserId(request.userId()));
        log.setImageUrl(request.imageUrl() == null ? "" : request.imageUrl().trim());
        log.setFoodName(request.foodName().trim());
        log.setCalories(request.calories());
        log.setProtein(request.protein());
        log.setCarbs(request.carbs());
        log.setFat(request.fat());
        log.setEstimatedCost(request.estimatedCost());
        log.setDate(request.date());
        log.setNote(request.note() == null ? "" : request.note().trim());
    }

    public List<FoodLogResponse> getLogs(String userId, String month) {
        MonthRange range = DateRangeUtils.parseMonth(month);
        return foodLogRepository.findByUserId(requireUserId(userId))
                .stream()
                .filter(log -> !log.getDate().isBefore(range.start()) && log.getDate().isBefore(range.endExclusive()))
                .sorted(Comparator.comparing(FoodLog::getDate).reversed().thenComparing(FoodLog::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    public List<FoodLogResponse> getLogsForDate(String userId, LocalDate date) {
        return foodLogRepository.findByUserIdAndDate(requireUserId(userId), date)
                .stream()
                .sorted(Comparator.comparing(FoodLog::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    public void deleteMealsByDate(String userId, LocalDate date) {
        foodLogRepository.deleteByUserIdAndDate(requireUserId(userId), date);
    }

    public void deleteFoodLog(String id) {
        foodLogRepository.deleteById(id);
    }

    private Optional<String> resolveExpenseCategory(String userId, String explicitCategoryName) {
        UserProfile profile = profileRepository.findByUserId(requireUserId(userId)).orElse(null);
        if (profile == null || profile.getCategories() == null) {
            return Optional.empty();
        }

        if (StringUtils.hasText(explicitCategoryName)) {
            return profile.getCategories().stream()
                    .map(category -> category.name().trim())
                    .filter(name -> name.equalsIgnoreCase(explicitCategoryName.trim()))
                    .findFirst();
        }

        return profile.getCategories().stream()
                .map(category -> category.name().trim())
                .filter(name -> {
                    String normalized = name.toLowerCase(Locale.ROOT);
                    return normalized.contains("food") || normalized.contains("meal") || normalized.contains("grocery");
                })
                .findFirst();
    }

    private String requireUserId(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("userId is required");
        }
        return userId.trim();
    }

    private FoodLogResponse toResponse(FoodLog log) {
        return new FoodLogResponse(
                log.getId(),
                log.getUserId(),
                log.getImageUrl(),
                log.getFoodName(),
                log.getCalories(),
                log.getProtein(),
                log.getCarbs(),
                log.getFat(),
                log.getEstimatedCost(),
                log.getDate(),
                log.getNote(),
                log.getLinkedExpenseId(),
                log.getCreatedAt()
        );
    }
}
