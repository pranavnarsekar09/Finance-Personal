package com.personalproject.tracker.profile.dto;

import com.personalproject.tracker.profile.UserCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record UpdateCategoriesRequest(
        @NotEmpty(message = "At least one category is required")
        List<@Valid UserCategory> categories
) {
}
