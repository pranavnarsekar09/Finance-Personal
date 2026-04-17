package com.personalproject.tracker.dashboard.dto;

public record CategorySpendSummary(
        String categoryName,
        Double budget,
        Double spent,
        double progress
) {
}
