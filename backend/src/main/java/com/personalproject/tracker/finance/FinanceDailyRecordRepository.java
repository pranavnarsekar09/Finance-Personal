package com.personalproject.tracker.finance;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FinanceDailyRecordRepository extends MongoRepository<FinanceDailyRecord, String> {

    List<FinanceDailyRecord> findByUserIdOrderByDateDesc(String userId);

    Optional<FinanceDailyRecord> findByUserIdAndDate(String userId, LocalDate date);

    List<FinanceDailyRecord> findByUserIdAndDateBetweenOrderByDateAsc(String userId, LocalDate startDate, LocalDate endDate);

    void deleteByUserId(String userId);
}
