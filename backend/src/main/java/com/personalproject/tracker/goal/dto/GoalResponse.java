package com.personalproject.tracker.goal.dto;

import com.personalproject.tracker.goal.GoalType;
import java.time.Instant;
import java.time.LocalDate;

public record GoalResponse(
        String id,
        String userId,
        GoalType type,
        Double targetAmount,
        Double currentAmount,
        LocalDate deadline,
        Instant createdAt,
        double progress
) {
}
