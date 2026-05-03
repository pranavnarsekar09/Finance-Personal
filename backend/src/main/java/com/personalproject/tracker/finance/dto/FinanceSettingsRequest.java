package com.personalproject.tracker.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record FinanceSettingsRequest(
        @NotNull(message = "dailyLimit is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "dailyLimit must be greater than 0")
        Double dailyLimit,
        @DecimalMin(value = "0.0", inclusive = true, message = "startingBuffer cannot be negative")
        Double startingBuffer,
        Double startingSavings,
        LocalDate trackingStartDate
) {
}
