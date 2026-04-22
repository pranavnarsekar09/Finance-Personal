package com.personalproject.tracker.food;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FoodLogRepository extends MongoRepository<FoodLog, String> {

    List<FoodLog> findByUserId(String userId);

    List<FoodLog> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);

    List<FoodLog> findByUserIdAndDate(String userId, LocalDate date);

    void deleteByUserIdAndDate(String userId, LocalDate date);
}
