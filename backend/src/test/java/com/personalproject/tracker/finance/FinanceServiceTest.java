package com.personalproject.tracker.finance;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.personalproject.tracker.expense.Expense;
import com.personalproject.tracker.expense.ExpenseRepository;
import com.personalproject.tracker.finance.dto.FinanceResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FinanceServiceTest {

    @Mock
    private UserFinanceRepository userFinanceRepository;

    @Mock
    private FinanceDailyRecordRepository financeDailyRecordRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    private FinanceService financeService;

    @BeforeEach
    void setUp() {
        financeService = new FinanceService(userFinanceRepository, financeDailyRecordRepository, expenseRepository);
        when(userFinanceRepository.save(any(UserFinance.class))).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(financeDailyRecordRepository.save(any(FinanceDailyRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(financeDailyRecordRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void updateDailyFinanceConsumesBufferThenSavingsForOverspend() {
        UserFinance finance = buildFinance(100.0, 15.0, 15.0, 15.0, 15.0, LocalDate.of(2026, 5, 4));
        when(userFinanceRepository.findAllByUserId("demo-user")).thenReturn(List.of(finance));
        when(financeDailyRecordRepository.findByUserIdAndDate("demo-user", LocalDate.of(2026, 5, 4))).thenReturn(Optional.empty());

        FinanceResponse response = financeService.updateDailyFinance("demo-user", 130.0, LocalDate.of(2026, 5, 4));

        assertEquals(0.0, response.buffer());
        assertEquals(0.0, response.savings());
        assertEquals(-30.0, response.todayDifference());
    }

    @Test
    void refreshFromExpensesSplitsLeftoverIntoBufferAndSavings() {
        LocalDate today = LocalDate.now();
        UserFinance finance = buildFinance(100.0, 0.0, 0.0, 0.0, 0.0, today);
        when(userFinanceRepository.findAllByUserId("demo-user")).thenReturn(List.of(finance));
        when(expenseRepository.findByUserId("demo-user")).thenReturn(List.of(buildExpense("demo-user", 80.0, today)));

        FinanceResponse response = financeService.refreshFromExpenses("demo-user");

        assertEquals(10.0, response.buffer());
        assertEquals(10.0, response.savings());
        assertEquals(20.0, response.todayDifference());
        verify(financeDailyRecordRepository).saveAll(any());
    }

    @Test
    void refreshFromExpensesKeepsBufferAtZeroAndAllowsNegativeSavings() {
        LocalDate today = LocalDate.now();
        UserFinance finance = buildFinance(100.0, 10.0, 5.0, 0.0, 0.0, today);
        when(userFinanceRepository.findAllByUserId("demo-user")).thenReturn(List.of(finance));
        when(expenseRepository.findByUserId("demo-user")).thenReturn(List.of(buildExpense("demo-user", 140.0, today)));

        FinanceResponse response = financeService.refreshFromExpenses("demo-user");

        assertEquals(0.0, response.buffer());
        assertEquals(-25.0, response.savings());
        verify(financeDailyRecordRepository, never()).save(any(FinanceDailyRecord.class));
    }

    @Test
    void getFinanceMergesDuplicateFinanceDocumentsInsteadOfFailing() {
        LocalDate today = LocalDate.now();
        UserFinance older = buildFinance(100.0, 0.0, 0.0, 0.0, 0.0, today.minusDays(2));
        older.setId("older");
        older.setLastProcessedDate(today.minusDays(2));

        UserFinance newer = buildFinance(100.0, 0.0, 0.0, 0.0, 0.0, today.minusDays(1));
        newer.setId("newer");
        newer.setLastProcessedDate(today.minusDays(1));

        when(userFinanceRepository.findAllByUserId("demo-user")).thenReturn(List.of(older, newer));
        when(expenseRepository.findByUserId("demo-user")).thenReturn(List.of(buildExpense("demo-user", 40.0, today)));

        FinanceResponse response = financeService.getFinance("demo-user");

        assertEquals(130.0, response.buffer());
        assertEquals(130.0, response.savings());
        verify(userFinanceRepository).deleteAll(List.of(older));
    }

    private UserFinance buildFinance(
            double dailyLimit,
            double startingBuffer,
            double startingSavings,
            double currentBuffer,
            double currentSavings,
            LocalDate trackingStartDate
    ) {
        UserFinance finance = new UserFinance();
        finance.setUserId("demo-user");
        finance.setDailyLimit(dailyLimit);
        finance.setStartingBuffer(startingBuffer);
        finance.setStartingSavings(startingSavings);
        finance.setBuffer(currentBuffer);
        finance.setSavings(currentSavings);
        finance.setTrackingStartDate(trackingStartDate);
        finance.setLastProcessedDate(trackingStartDate);
        return finance;
    }

    private Expense buildExpense(String userId, double amount, LocalDate date) {
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setAmount(amount);
        expense.setDate(date);
        return expense;
    }
}
