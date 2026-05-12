package com.personalproject.tracker.income;

import com.personalproject.tracker.income.dto.CreateIncomeRequest;
import com.personalproject.tracker.income.dto.IncomeResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/income")
public class IncomeController {

    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    @PostMapping
    public IncomeResponse createIncome(@Valid @RequestBody CreateIncomeRequest request) {
        return incomeService.createIncome(request);
    }

    @GetMapping
    public List<IncomeResponse> getIncomes(
            @RequestParam String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return incomeService.getIncomes(userId, start, end);
    }

    @DeleteMapping("/{id}")
    public void deleteIncome(@PathVariable String id) {
        incomeService.deleteIncome(id);
    }
}
