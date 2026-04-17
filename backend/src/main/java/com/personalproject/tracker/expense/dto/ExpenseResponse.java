package com.personalproject.tracker.expense.dto;

import com.personalproject.tracker.expense.PaymentMethod;
import java.time.Instant;
import java.time.LocalDate;

public record ExpenseResponse(
        String id,
        String userId,
        Double amount,
        String categoryName,
        PaymentMethod paymentMethod,
        LocalDate date,
        String note,
        boolean isRecurring,
        Instant createdAt
) {
}
