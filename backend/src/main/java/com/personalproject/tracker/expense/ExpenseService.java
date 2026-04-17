package com.personalproject.tracker.expense;

import com.personalproject.tracker.common.ResourceNotFoundException;
import com.personalproject.tracker.expense.dto.CreateExpenseRequest;
import com.personalproject.tracker.expense.dto.ExpenseResponse;
import com.personalproject.tracker.profile.ProfileRepository;
import com.personalproject.tracker.profile.UserProfile;
import com.personalproject.tracker.shared.DateRangeUtils;
import com.personalproject.tracker.shared.MonthRange;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Comparator;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ProfileRepository profileRepository;

    public ExpenseService(ExpenseRepository expenseRepository, ProfileRepository profileRepository) {
        this.expenseRepository = expenseRepository;
        this.profileRepository = profileRepository;
    }

    public ExpenseResponse createExpense(CreateExpenseRequest request) {
        validateUserCategory(request.userId(), request.categoryName());

        Expense expense = new Expense();
        applyExpenseRequest(expense, request);
        expense.setCreatedAt(Instant.now());

        return toResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(String id, CreateExpenseRequest request) {
        validateUserCategory(request.userId(), request.categoryName());
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found for id: " + id));

        applyExpenseRequest(expense, request);

        return toResponse(expenseRepository.save(expense));
    }

    private void applyExpenseRequest(Expense expense, CreateExpenseRequest request) {
        expense.setUserId(request.userId().trim());
        expense.setAmount(request.amount());
        expense.setCategoryName(request.categoryName().trim());
        expense.setPaymentMethod(request.paymentMethod());
        expense.setDate(request.date());
        expense.setNote(request.note() == null ? "" : request.note().trim());
        expense.setRecurring(request.isRecurring());
    }

    public List<ExpenseResponse> getExpenses(String userId, String month) {
        MonthRange range = DateRangeUtils.parseMonth(month);
        return expenseRepository.findByUserId(requireUserId(userId))
                .stream()
                .filter(expense -> !expense.getDate().isBefore(range.start()) && expense.getDate().isBefore(range.endExclusive()))
                .sorted(Comparator.comparing(Expense::getDate).reversed().thenComparing(Expense::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    public List<ExpenseResponse> getExpensesForDate(String userId, LocalDate date) {
        return expenseRepository.findByUserIdAndDate(requireUserId(userId), date)
                .stream()
                .sorted(Comparator.comparing(Expense::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    public void deleteExpense(String id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found for id: " + id);
        }
        expenseRepository.deleteById(id);
    }

    public void deleteExpensesByDate(String userId, LocalDate date) {
        expenseRepository.deleteByUserIdAndDate(requireUserId(userId), date);
    }

    public ExpenseResponse addDerivedExpense(
            String userId,
            Double amount,
            String categoryName,
            PaymentMethod paymentMethod,
            LocalDate date,
            String note
    ) {
        return createExpense(new CreateExpenseRequest(userId, amount, categoryName, paymentMethod, date, note, false));
    }

    private void validateUserCategory(String userId, String categoryName) {
        if (!StringUtils.hasText(categoryName)) {
            throw new IllegalArgumentException("Category name is required");
        }

        UserProfile profile = profileRepository.findByUserId(requireUserId(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for userId: " + userId));

        boolean exists = profile.getCategories() != null && profile.getCategories().stream()
                .anyMatch(category -> category.name().trim().equalsIgnoreCase(categoryName.trim()));

        if (!exists) {
            throw new IllegalArgumentException("Category does not exist in user's profile");
        }
    }

    private String requireUserId(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("userId is required");
        }
        return userId.trim().toLowerCase(Locale.ROOT).equals(userId.trim().toLowerCase(Locale.ROOT))
                ? userId.trim()
                : userId.trim();
    }

    private ExpenseResponse toResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getUserId(),
                expense.getAmount(),
                expense.getCategoryName(),
                expense.getPaymentMethod(),
                expense.getDate(),
                expense.getNote(),
                expense.isRecurring(),
                expense.getCreatedAt()
        );
    }
}
