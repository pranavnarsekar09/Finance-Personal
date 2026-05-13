package com.personalproject.tracker.coveredexpense;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.personalproject.tracker.coveredexpense.dto.CoveredExpenseResponse;
import com.personalproject.tracker.coveredexpense.dto.CreateCoveredExpenseRequest;

@RestController
@RequestMapping("/api/covered-expenses")
public class CoveredExpenseController {
    private final CoveredExpenseService service;

    public CoveredExpenseController(CoveredExpenseService service) {
        this.service = service;
    }

    @GetMapping
    public List<CoveredExpenseResponse> getAll(@RequestParam String userId) {
        return service.getByUserId(userId);
    }

    @PostMapping
    public CoveredExpenseResponse create(@RequestBody CreateCoveredExpenseRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public CoveredExpenseResponse update(@PathVariable String id, @RequestBody CreateCoveredExpenseRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}