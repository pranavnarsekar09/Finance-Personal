package com.personalproject.tracker.food;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FoodLogRepository extends MongoRepository<FoodLog, String> {

    List<FoodLog> findByUserId(String userId);

    List<FoodLog> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);

    @org.springframework.data.mongodb.repository.Query("{'userId': ?0, 'date': { $gte: ?1, $lt: ?2 }}")
    List<FoodLog> findByUserIdAndDateGreaterThanEqualAndDateLessThan(String userId, LocalDate startDate, LocalDate endDate);

    List<FoodLog> findByUserIdAndDate(String userId, LocalDate date);

    List<FoodLog> findByLinkedExpenseId(String linkedExpenseId);

    void deleteByUserIdAndDate(String userId, LocalDate date);

    @org.springframework.data.mongodb.repository.Query(value = "{'userId': ?0, 'date': { $gte: ?1, $lt: ?2 }}", delete = true)
    void deleteByUserIdAndDateGreaterThanEqualAndDateLessThan(String userId, LocalDate startDate, LocalDate endDate);
}
