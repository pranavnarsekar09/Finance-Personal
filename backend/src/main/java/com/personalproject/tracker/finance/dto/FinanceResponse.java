package com.personalproject.tracker.finance.dto;

import java.time.LocalDate;
import java.util.List;

public record FinanceResponse(
        String userId,
        Double dailyLimit,
        Double startingBuffer,
        Double startingSavings,
        Double buffer,
        Double savings,
        LocalDate trackingStartDate,
        LocalDate lastProcessedDate,
        Double todaySpent,
        Double todayDifference,
        List<FinanceDailyRecordResponse> recentDailyRecords
) {
}
