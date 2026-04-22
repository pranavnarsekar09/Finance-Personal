package com.personalproject.tracker.expense;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ExpenseRepository extends MongoRepository<Expense, String> {

    List<Expense> findByUserId(String userId);

    List<Expense> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserIdAndDate(String userId, LocalDate date);

    void deleteByUserIdAndDate(String userId, LocalDate date);
}
