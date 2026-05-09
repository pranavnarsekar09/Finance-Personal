package com.personalproject.tracker.finance;

import com.personalproject.tracker.finance.dto.FinanceResponse;
import com.personalproject.tracker.finance.dto.FinanceSettingsRequest;
import com.personalproject.tracker.finance.dto.UpdateDailyFinanceRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public FinanceResponse getFinance(
            @RequestParam String userId,
            @RequestParam(required = false) String today
    ) {
        java.time.LocalDate todayDate = today != null ? java.time.LocalDate.parse(today) : java.time.LocalDate.now();
        return financeService.getFinance(userId, todayDate);
    }

    @PutMapping
    public FinanceResponse upsertFinance(
            @RequestParam String userId,
            @Valid @RequestBody FinanceSettingsRequest request
    ) {
        return financeService.upsertFinance(userId, request);
    }

    @PostMapping("/update-daily")
    public FinanceResponse updateDailyFinance(@Valid @RequestBody UpdateDailyFinanceRequest request) {
        return financeService.updateDailyFinance(request.userId(), request.spentAmount(), request.date());
    }
}
