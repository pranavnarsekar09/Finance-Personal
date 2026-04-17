package com.personalproject.tracker.profile;

import com.personalproject.tracker.common.ResourceNotFoundException;
import com.personalproject.tracker.profile.dto.ProfileResponse;
import com.personalproject.tracker.profile.dto.ProfileUpsertRequest;
import com.personalproject.tracker.profile.dto.UpdateCategoriesRequest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public ProfileResponse getProfile(String userId) {
        UserProfile profile = findProfile(userId);
        return toResponse(profile);
    }

    public ProfileResponse upsertProfile(String userId, ProfileUpsertRequest request) {
        validateUserId(userId);
        validateCategories(request.categories(), false);

        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(UserProfile::new);

        if (profile.getCreatedAt() == null) {
            profile.setCreatedAt(Instant.now());
        }

        profile.setUserId(userId.trim());
        profile.setName(request.name().trim());
        profile.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        profile.setMonthlyBudget(request.monthlyBudget());
        profile.setCalorieGoal(request.calorieGoal());

        if (request.categories() != null) {
            profile.setCategories(new ArrayList<>(request.categories()));
        } else if (profile.getCategories() == null) {
            profile.setCategories(new ArrayList<>());
        }

        UserProfile savedProfile = profileRepository.save(profile);
        return toResponse(savedProfile);
    }

    public ProfileResponse updateCategories(String userId, UpdateCategoriesRequest request) {
        validateUserId(userId);
        validateCategories(request.categories(), true);

        UserProfile profile = findProfile(userId);
        profile.setCategories(new ArrayList<>(request.categories()));

        UserProfile savedProfile = profileRepository.save(profile);
        return toResponse(savedProfile);
    }

    private UserProfile findProfile(String userId) {
        validateUserId(userId);
        return profileRepository.findByUserId(userId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for userId: " + userId));
    }

    private void validateUserId(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("userId query parameter is required");
        }
    }

    private void validateCategories(List<UserCategory> categories, boolean requireAtLeastOne) {
        if (categories == null) {
            if (requireAtLeastOne) {
                throw new IllegalArgumentException("At least one category is required");
            }
            return;
        }

        if (requireAtLeastOne && categories.isEmpty()) {
            throw new IllegalArgumentException("At least one category is required");
        }

        Set<String> normalizedNames = categories.stream()
                .map(UserCategory::name)
                .map(name -> name == null ? "" : name.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        if (normalizedNames.contains("")) {
            throw new IllegalArgumentException("Category name is required");
        }

        if (normalizedNames.size() != categories.size()) {
            throw new IllegalArgumentException("Category names must be unique");
        }
    }

    private ProfileResponse toResponse(UserProfile profile) {
        List<UserCategory> categories = profile.getCategories() == null
                ? List.of()
                : List.copyOf(profile.getCategories());

        return new ProfileResponse(
                profile.getUserId(),
                profile.getName(),
                profile.getEmail(),
                profile.getMonthlyBudget(),
                profile.getCalorieGoal(),
                categories,
                profile.getCreatedAt(),
                isOnboardingComplete(profile)
        );
    }

    private boolean isOnboardingComplete(UserProfile profile) {
        return StringUtils.hasText(profile.getName())
                && StringUtils.hasText(profile.getEmail())
                && profile.getMonthlyBudget() != null
                && profile.getMonthlyBudget() > 0
                && profile.getCalorieGoal() != null
                && profile.getCalorieGoal() > 0
                && profile.getCategories() != null
                && !profile.getCategories().isEmpty();
    }
}
