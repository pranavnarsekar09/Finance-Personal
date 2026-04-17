package com.personalproject.tracker.profile;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.personalproject.tracker.common.GlobalExceptionHandler;
import com.personalproject.tracker.common.ResourceNotFoundException;
import com.personalproject.tracker.profile.dto.ProfileResponse;
import com.personalproject.tracker.profile.dto.ProfileUpsertRequest;
import com.personalproject.tracker.profile.dto.UpdateCategoriesRequest;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ProfileControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ProfileService profileService = new StubProfileService();
        mockMvc = MockMvcBuilders.standaloneSetup(new ProfileController(profileService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getProfileReturnsStoredProfile() throws Exception {
        mockMvc.perform(get("/api/profile").param("userId", "demo-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("demo-user"))
                .andExpect(jsonPath("$.categories[0].name").value("Groceries"))
                .andExpect(jsonPath("$.onboardingComplete").value(true));
    }

    @Test
    void updateCategoriesValidatesRequestBody() throws Exception {
        mockMvc.perform(put("/api/profile/categories")
                        .param("userId", "demo-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "categories": []
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    private static class StubProfileService extends ProfileService {

        StubProfileService() {
            super(null);
        }

        @Override
        public ProfileResponse getProfile(String userId) {
            if (!"demo-user".equals(userId)) {
                throw new ResourceNotFoundException("Profile not found for userId: " + userId);
            }

            return new ProfileResponse(
                    "demo-user",
                    "Aarav",
                    "aarav@example.com",
                    25000.0,
                    2200.0,
                    List.of(new UserCategory("Groceries", 7000.0)),
                    Instant.parse("2026-04-17T06:00:00Z"),
                    true
            );
        }

        @Override
        public ProfileResponse upsertProfile(String userId, ProfileUpsertRequest request) {
            return null;
        }

        @Override
        public ProfileResponse updateCategories(String userId, UpdateCategoriesRequest request) {
            return null;
        }
    }
}
