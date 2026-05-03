package com.personalproject.tracker.dashboard.dto;

import java.time.LocalDate;

public record SpendingSummary(
        Double dailyLimit,
        Double buffer,
        Double savings,
        Double todaySpent,
        Double todayDifference,
        LocalDate trackingStartDate,
        LocalDate lastProcessedDate
) {
}
