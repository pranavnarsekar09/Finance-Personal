package com.personalproject.tracker.profile;

import com.personalproject.tracker.profile.dto.AddMoneyRequest;
import com.personalproject.tracker.profile.dto.ProfileResponse;
import com.personalproject.tracker.profile.dto.ProfileUpsertRequest;
import com.personalproject.tracker.profile.dto.UpdateCategoriesRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ProfileResponse getProfile(@RequestParam String userId) {
        return profileService.getProfile(userId);
    }

    @PutMapping
    public ProfileResponse upsertProfile(
            @RequestParam String userId,
            @Valid @RequestBody ProfileUpsertRequest request
    ) {
        return profileService.upsertProfile(userId, request);
    }

    @PutMapping("/categories")
    public ProfileResponse updateCategories(
            @RequestParam String userId,
            @Valid @RequestBody UpdateCategoriesRequest request
    ) {
        return profileService.updateCategories(userId, request);
    }

    @PostMapping("/add-money")
    public ProfileResponse addMoney(
            @RequestParam String userId,
            @Valid @RequestBody AddMoneyRequest request
    ) {
        return profileService.addMoney(userId, request.amount());
    }
}
