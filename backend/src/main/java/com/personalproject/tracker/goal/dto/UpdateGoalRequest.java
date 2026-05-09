package com.personalproject.tracker.goal.dto;

import com.personalproject.tracker.goal.GoalType;
import jakarta.validation.constraints.DecimalMin;
import java.time.LocalDate;

public record UpdateGoalRequest(
        GoalType type,
        @DecimalMin(value = "0.0", message = "Target amount cannot be negative")
        Double targetAmount,
        @DecimalMin(value = "0.0", message = "Current amount cannot be negative")
        Double currentAmount,
        LocalDate deadline
) {
}
