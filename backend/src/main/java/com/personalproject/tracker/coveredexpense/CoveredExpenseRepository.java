package com.personalproject.tracker.coveredexpense;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CoveredExpenseRepository extends MongoRepository<CoveredExpense, String> {
    List<CoveredExpense> findByUserId(String userId);
}