package com.personalproject.tracker.dashboard.dto;

import java.time.LocalDate;

public record DailySpendSummary(
        LocalDate date,
        Double amount
) {
}
