package com.personalproject.tracker.profile.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddMoneyRequest(
        @NotNull Double amount,
        String note
) {
}
