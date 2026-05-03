package com.personalproject.tracker.finance;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.personalproject.tracker.common.GlobalExceptionHandler;
import com.personalproject.tracker.finance.dto.FinanceResponse;
import com.personalproject.tracker.finance.dto.FinanceSettingsRequest;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class FinanceControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        FinanceService financeService = new StubFinanceService();
        mockMvc = MockMvcBuilders.standaloneSetup(new FinanceController(financeService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getFinanceReturnsCurrentSummary() throws Exception {
        mockMvc.perform(get("/api/finance").param("userId", "demo-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dailyLimit").value(100.0))
                .andExpect(jsonPath("$.buffer").value(25.0))
                .andExpect(jsonPath("$.savings").value(80.0));
    }

    @Test
    void updateDailyFinanceValidatesSpentAmount() throws Exception {
        mockMvc.perform(post("/api/finance/update-daily")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userId": "demo-user",
                                  "spentAmount": -5
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    private static class StubFinanceService extends FinanceService {

        StubFinanceService() {
            super(null, null, null);
        }

        @Override
        public FinanceResponse getFinance(String userId) {
            return new FinanceResponse(
                    userId,
                    100.0,
                    10.0,
                    50.0,
                    25.0,
                    80.0,
                    LocalDate.of(2026, 5, 1),
                    LocalDate.of(2026, 5, 4),
                    75.0,
                    25.0,
                    List.of()
            );
        }

        @Override
        public FinanceResponse upsertFinance(String userId, FinanceSettingsRequest request) {
            return getFinance(userId);
        }
    }
}
