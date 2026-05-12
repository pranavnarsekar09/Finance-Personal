package com.personalproject.tracker.income.dto;

import java.time.Instant;
import java.time.LocalDate;

public record IncomeResponse(
    String id,
    String userId,
    Double amount,
    String source,
    String note,
    LocalDate date,
    boolean isRecurring,
    Instant createdAt
) {}
