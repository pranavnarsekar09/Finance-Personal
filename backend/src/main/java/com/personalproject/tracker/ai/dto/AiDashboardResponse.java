package com.personalproject.tracker.ai.dto;

import java.util.List;

public record AiDashboardResponse(
        String userId,
        String generatedAt,
        List<AiPrediction> predictions,
        List<AiRecommendation> recommendations,
        List<AiAnomaly> anomalies,
        List<AiScore> scores
) {
}
