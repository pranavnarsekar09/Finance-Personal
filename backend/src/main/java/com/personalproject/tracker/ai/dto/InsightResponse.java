package com.personalproject.tracker.ai.dto;

public record InsightResponse(
        String userId,
        String headline,
        String summary,
        double runwayDays,
        double averageDailySpend,
        String topCategory
) {
}
