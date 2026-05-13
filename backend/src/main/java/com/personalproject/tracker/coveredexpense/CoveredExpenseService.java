package com.personalproject.tracker.coveredexpense;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.personalproject.tracker.coveredexpense.dto.CoveredExpenseResponse;
import com.personalproject.tracker.coveredexpense.dto.CreateCoveredExpenseRequest;

@Service
public class CoveredExpenseService {
    private final CoveredExpenseRepository repository;

    public CoveredExpenseService(CoveredExpenseRepository repository) {
        this.repository = repository;
    }

    public List<CoveredExpenseResponse> getByUserId(String userId) {
        return repository.findByUserId(userId).stream()
            .map(this::toResponse)
            .toList();
    }

    public CoveredExpenseResponse create(CreateCoveredExpenseRequest request) {
        CoveredExpense expense = new CoveredExpense();
        expense.setUserId(request.getUserId());
        expense.setName(request.getName());
        expense.setAmount(request.getAmount());
        expense.setWhoCovers(request.getWhoCovers());
        expense.setFrequency(request.getFrequency());
        expense.setNextDueDate(request.getNextDueDate());
        expense.setCreatedAt(Instant.now());
        
        CoveredExpense saved = repository.save(expense);
        return toResponse(saved);
    }

    public CoveredExpenseResponse update(String id, CreateCoveredExpenseRequest request) {
        Optional<CoveredExpense> existing = repository.findById(id);
        if (existing.isEmpty()) {
            throw new RuntimeException("Covered expense not found");
        }
        
        CoveredExpense expense = existing.get();
        expense.setName(request.getName());
        expense.setAmount(request.getAmount());
        expense.setWhoCovers(request.getWhoCovers());
        expense.setFrequency(request.getFrequency());
        expense.setNextDueDate(request.getNextDueDate());
        
        CoveredExpense saved = repository.save(expense);
        return toResponse(saved);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }

    private CoveredExpenseResponse toResponse(CoveredExpense expense) {
        CoveredExpenseResponse response = new CoveredExpenseResponse();
        response.setId(expense.getId());
        response.setName(expense.getName());
        response.setAmount(expense.getAmount());
        response.setWhoCovers(expense.getWhoCovers());
        response.setFrequency(expense.getFrequency());
        response.setNextDueDate(expense.getNextDueDate() != null ? expense.getNextDueDate().toString() : null);
        response.setCreatedAt(expense.getCreatedAt() != null ? expense.getCreatedAt().toString() : null);
        return response;
    }
}