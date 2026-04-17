package com.personalproject.tracker.profile.dto;

import com.personalproject.tracker.profile.UserCategory;
import java.time.Instant;
import java.util.List;

public record ProfileResponse(
        String userId,
        String name,
        String email,
        Double monthlyBudget,
        Double calorieGoal,
        List<UserCategory> categories,
        Instant createdAt,
        boolean onboardingComplete
) {
}
