package com.personalproject.tracker.expense;

import com.personalproject.tracker.expense.dto.CreateExpenseRequest;
import com.personalproject.tracker.expense.dto.ExpenseResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ExpenseResponse createExpense(@Valid @RequestBody CreateExpenseRequest request) {
        return expenseService.createExpense(request);
    }

    @PutMapping("/{id}")
    public ExpenseResponse updateExpense(@PathVariable String id, @Valid @RequestBody CreateExpenseRequest request) {
        return expenseService.updateExpense(id, request);
    }

    @GetMapping
    public List<ExpenseResponse> getExpenses(@RequestParam String userId, @RequestParam String month) {
        return expenseService.getExpenses(userId, month);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable String id) {
        expenseService.deleteExpense(id);
    }
}
