package com.personalproject.tracker.ai.dto;

import java.util.List;

public record AiScore(
        String name,
        int value,
        String trend,
        String explanation,
        List<String> breakdown
) {
}
