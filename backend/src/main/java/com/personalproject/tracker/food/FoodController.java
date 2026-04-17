package com.personalproject.tracker.food;

import com.personalproject.tracker.food.dto.AnalyzeFoodRequest;
import com.personalproject.tracker.food.dto.CreateFoodLogRequest;
import com.personalproject.tracker.food.dto.FoodAnalysisResponse;
import com.personalproject.tracker.food.dto.FoodLogResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/api/food")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @PostMapping("/analyze")
    public FoodAnalysisResponse analyze(@Valid @RequestBody AnalyzeFoodRequest request) {
        return foodService.analyze(request);
    }

    @PostMapping("/logs")
    public FoodLogResponse createLog(@Valid @RequestBody CreateFoodLogRequest request) {
        return foodService.createFoodLog(request);
    }

    @PutMapping("/logs/{id}")
    public FoodLogResponse updateLog(@PathVariable String id, @Valid @RequestBody CreateFoodLogRequest request) {
        return foodService.updateFoodLog(id, request);
    }

    @GetMapping("/logs")
    public List<FoodLogResponse> getLogs(@RequestParam String userId, @RequestParam String month) {
        return foodService.getLogs(userId, month);
    }

    @DeleteMapping("/logs/{id}")
    public void deleteLog(@PathVariable String id) {
        foodService.deleteFoodLog(id);
    }
}
