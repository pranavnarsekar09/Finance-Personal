package com.personalproject.tracker.shared;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;

public final class DateRangeUtils {

    private DateRangeUtils() {
    }

    public static MonthRange parseMonth(String month) {
        try {
            YearMonth yearMonth = YearMonth.parse(month);
            return new MonthRange(yearMonth.atDay(1), yearMonth.plusMonths(1).atDay(1));
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Month must be in YYYY-MM format");
        }
    }

    public static LocalDate parseDate(String date) {
        try {
            return LocalDate.parse(date);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Date must be in YYYY-MM-DD format");
        }
    }
}
