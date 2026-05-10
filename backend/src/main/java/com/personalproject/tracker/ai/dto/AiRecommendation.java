package com.personalproject.tracker.ai.dto;

import java.util.List;

public record AiRecommendation(
        String title,
        String detail,
        String impact,
        List<String> breakdown
) {
}
