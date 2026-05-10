package com.personalproject.tracker.ai;

import com.personalproject.tracker.ai.dto.InsightResponse;
import com.personalproject.tracker.ai.dto.AiDashboardResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class InsightController {

    private final InsightService insightService;

    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @GetMapping("/insight")
    public InsightResponse getInsight(@RequestParam String userId) {
        return insightService.getInsight(userId);
    }

    @GetMapping("/dashboard")
    public AiDashboardResponse getDashboard(@RequestParam String userId) {
        return insightService.getDashboard(userId);
    }
}
