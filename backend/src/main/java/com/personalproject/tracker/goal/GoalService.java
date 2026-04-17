package com.personalproject.tracker.goal;

import com.personalproject.tracker.goal.dto.CreateGoalRequest;
import com.personalproject.tracker.goal.dto.GoalResponse;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class GoalService {

    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    public GoalResponse createGoal(CreateGoalRequest request) {
        Goal goal = new Goal();
        goal.setUserId(requireUserId(request.userId()));
        goal.setType(request.type());
        goal.setTargetAmount(request.targetAmount());
        goal.setCurrentAmount(request.currentAmount());
        goal.setDeadline(request.deadline());
        goal.setCreatedAt(Instant.now());
        return toResponse(goalRepository.save(goal));
    }

    public List<GoalResponse> getGoals(String userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(requireUserId(userId))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String requireUserId(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("userId is required");
        }
        return userId.trim();
    }

    private GoalResponse toResponse(Goal goal) {
        double progress = goal.getTargetAmount() == null || goal.getTargetAmount() == 0
                ? 0
                : Math.min(100.0, (goal.getCurrentAmount() / goal.getTargetAmount()) * 100.0);
        return new GoalResponse(
                goal.getId(),
                goal.getUserId(),
                goal.getType(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                goal.getDeadline(),
                goal.getCreatedAt(),
                progress
        );
    }
}
