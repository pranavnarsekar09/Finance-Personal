package com.personalproject.tracker.goal.dto;

import com.personalproject.tracker.goal.GoalType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateGoalRequest(
        @NotBlank(message = "userId is required")
        String userId,
        @NotNull(message = "Goal type is required")
        GoalType type,
        @NotNull(message = "Target amount is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Target amount must be greater than 0")
        Double targetAmount,
        @NotNull(message = "Current amount is required")
        @DecimalMin(value = "0.0", message = "Current amount cannot be negative")
        Double currentAmount,
        @NotNull(message = "Deadline is required")
        @Future(message = "Deadline must be in the future")
        LocalDate deadline
) {
}
