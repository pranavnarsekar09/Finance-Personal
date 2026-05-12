package com.personalproject.tracker.income.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateIncomeRequest(
    @NotBlank String userId,
    @NotNull Double amount,
    @NotBlank String source,
    String note,
    @NotNull LocalDate date,
    boolean isRecurring
) {}
