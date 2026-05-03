package com.personalproject.tracker.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record UpdateDailyFinanceRequest(
        @NotBlank(message = "userId is required")
        String userId,
        @NotNull(message = "spentAmount is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "spentAmount cannot be negative")
        Double spentAmount,
        LocalDate date
) {
}
