package com.personalproject.tracker.income;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncomeRepository extends MongoRepository<Income, String> {
    List<Income> findByUserId(String userId);
    List<Income> findByUserIdAndDateBetween(String userId, LocalDate start, LocalDate end);
    void deleteByUserId(String userId);
}
