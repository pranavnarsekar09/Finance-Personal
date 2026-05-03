package com.personalproject.tracker.finance.dto;

import java.time.LocalDate;

public record FinanceDailyRecordResponse(
        LocalDate date,
        Double spentAmount,
        Double dailyLimit,
        Double leftoverAmount,
        Double extraAmount,
        Double bufferChange,
        Double savingsChange,
        Double bufferAfter,
        Double savingsAfter
) {
}
