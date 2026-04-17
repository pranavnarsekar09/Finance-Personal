package com.personalproject.tracker.expense.dto;

import com.personalproject.tracker.expense.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateExpenseRequest(
        @NotBlank(message = "userId is required")
        String userId,
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
        Double amount,
        @NotBlank(message = "Category name is required")
        String categoryName,
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,
        @NotNull(message = "Date is required")
        LocalDate date,
        String note,
        boolean isRecurring
) {
}
