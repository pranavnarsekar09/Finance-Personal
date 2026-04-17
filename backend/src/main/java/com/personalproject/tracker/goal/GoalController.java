package com.personalproject.tracker.goal;

import com.personalproject.tracker.goal.dto.CreateGoalRequest;
import com.personalproject.tracker.goal.dto.GoalResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public GoalResponse createGoal(@Valid @RequestBody CreateGoalRequest request) {
        return goalService.createGoal(request);
    }

    @GetMapping
    public List<GoalResponse> getGoals(@RequestParam String userId) {
        return goalService.getGoals(userId);
    }
}
