package com.personalproject.tracker.history;

import com.personalproject.tracker.history.dto.CalendarEntryResponse;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/history/calendar")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping
    public List<CalendarEntryResponse> getCalendar(@RequestParam String userId, @RequestParam String month) {
        return calendarService.getCalendar(userId, month);
    }

    @DeleteMapping("/expenses")
    public void deleteExpenses(@RequestParam String userId, @RequestParam String date) {
        calendarService.deleteExpensesByDate(userId, date);
    }

    @DeleteMapping("/expenses/month")
    public void deleteExpensesByMonth(@RequestParam String userId, @RequestParam String month) {
        calendarService.deleteExpensesByMonth(userId, month);
    }

    @DeleteMapping("/meals")
    public void deleteMeals(@RequestParam String userId, @RequestParam String date) {
        calendarService.deleteMealsByDate(userId, date);
    }

    @DeleteMapping("/meals/month")
    public void deleteMealsByMonth(@RequestParam String userId, @RequestParam String month) {
        calendarService.deleteMealsByMonth(userId, month);
    }
}
