package com.personalproject.tracker.finance;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserFinanceRepository extends MongoRepository<UserFinance, String> {

    Optional<UserFinance> findByUserId(String userId);

    List<UserFinance> findAllByUserId(String userId);
}
