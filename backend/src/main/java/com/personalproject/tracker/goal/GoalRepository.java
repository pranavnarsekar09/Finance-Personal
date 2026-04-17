package com.personalproject.tracker.goal;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GoalRepository extends MongoRepository<Goal, String> {

    List<Goal> findByUserIdOrderByCreatedAtDesc(String userId);
}
