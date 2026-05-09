package com.personalproject.tracker.finance;

import com.personalproject.tracker.expense.Expense;
import com.personalproject.tracker.expense.ExpenseRepository;
import com.personalproject.tracker.finance.dto.FinanceDailyRecordResponse;
import com.personalproject.tracker.finance.dto.FinanceResponse;
import com.personalproject.tracker.finance.dto.FinanceSettingsRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class FinanceService {

    private static final double DEFAULT_DAILY_LIMIT = 100.0;
    private static final int RECENT_RECORD_LIMIT = 14;

    private final UserFinanceRepository userFinanceRepository;
    private final FinanceDailyRecordRepository financeDailyRecordRepository;
    private final ExpenseRepository expenseRepository;

    public FinanceService(
            UserFinanceRepository userFinanceRepository,
            FinanceDailyRecordRepository financeDailyRecordRepository,
            ExpenseRepository expenseRepository
    ) {
        this.userFinanceRepository = userFinanceRepository;
        this.financeDailyRecordRepository = financeDailyRecordRepository;
        this.expenseRepository = expenseRepository;
    }

    public FinanceResponse getFinance(String userId, LocalDate today) {
        String normalizedUserId = requireUserId(userId);
        UserFinance finance = getOrCreateFinance(normalizedUserId);
        return refreshFromExpenses(finance, today);
    }

    public FinanceResponse upsertFinance(String userId, FinanceSettingsRequest request) {
        String normalizedUserId = requireUserId(userId);
        validateSettings(request);

        UserFinance finance = getOrCreateFinance(normalizedUserId);

        finance.setDailyLimit(roundMoney(request.dailyLimit()));
        finance.setStartingBuffer(roundMoney(defaultIfNull(request.startingBuffer(), 0.0)));
        finance.setStartingSavings(roundMoney(defaultIfNull(request.startingSavings(), 0.0)));
        finance.setTrackingStartDate(request.trackingStartDate() != null ? request.trackingStartDate() : resolveDefaultTrackingStartDate(normalizedUserId));

        userFinanceRepository.save(finance);
        return refreshFromExpenses(finance, LocalDate.now());
    }

    public FinanceResponse updateDailyFinance(String userId, Double spentAmount, LocalDate date) {
        String normalizedUserId = requireUserId(userId);
        if (spentAmount == null || spentAmount < 0) {
            throw new IllegalArgumentException("spentAmount cannot be negative");
        }

        UserFinance finance = getOrCreateFinance(normalizedUserId);
        LocalDate effectiveDate = date != null ? date : LocalDate.now();

        // Run the requested day through the same business rules used by expense-driven recalculation.
        DailyComputationResult result = applyDailyRules(
                effectiveDate,
                roundMoney(spentAmount),
                roundMoney(defaultIfNull(finance.getDailyLimit(), DEFAULT_DAILY_LIMIT)),
                roundMoney(defaultIfNull(finance.getBuffer(), defaultIfNull(finance.getStartingBuffer(), 0.0))),
                roundMoney(defaultIfNull(finance.getSavings(), defaultIfNull(finance.getStartingSavings(), 0.0))),
                normalizedUserId,
                effectiveDate.isBefore(LocalDate.now())
        );

        financeDailyRecordRepository.findByUserIdAndDate(normalizedUserId, effectiveDate)
                .ifPresent(existingRecord -> result.record().setId(existingRecord.getId()));
        finance.setBuffer(result.record().getBufferAfter());
        finance.setSavings(result.record().getSavingsAfter());
        finance.setLastProcessedDate(effectiveDate);
        financeDailyRecordRepository.save(result.record());
        userFinanceRepository.save(finance);

        return buildResponse(finance, result.record().getSpentAmount(), result.difference(), List.of(result.record()));
    }

    public FinanceResponse refreshFromExpenses(String userId) {
        return refreshFromExpenses(requireUserId(userId), LocalDate.now());
    }

    public FinanceSnapshot getFinanceSnapshot(String userId, LocalDate today) {
        FinanceResponse response = refreshFromExpenses(requireUserId(userId), today);
        return new FinanceSnapshot(
                response.dailyLimit(),
                response.buffer(),
                response.savings(),
                response.todaySpent(),
                response.todayDifference(),
                response.trackingStartDate(),
                response.lastProcessedDate()
        );
    }

    private FinanceResponse refreshFromExpenses(String userId, LocalDate today) {
        UserFinance finance = getOrCreateFinance(userId);
        return refreshFromExpenses(finance, today);
    }

    private FinanceResponse refreshFromExpenses(UserFinance finance, LocalDate today) {
        // Step 1: Collect total spend per calendar day so repeated expense edits stay idempotent.
        Map<LocalDate, Double> spentByDate = loadSpentByDate(finance.getUserId());

        // Step 2: Decide which day the finance engine should start from.
        LocalDate startDate = finance.getTrackingStartDate() != null ? finance.getTrackingStartDate() : resolveDefaultTrackingStartDate(finance.getUserId());
        if (startDate.isAfter(today)) {
            startDate = today;
        }

        // Step 3: Replay the business rules day-by-day and rebuild the persisted daily records.
        List<FinanceDailyRecord> rebuiltRecords = new ArrayList<>();
        double currentBuffer = roundMoney(defaultIfNull(finance.getStartingBuffer(), 0.0));
        double currentSavings = roundMoney(defaultIfNull(finance.getStartingSavings(), 0.0));
        double dailyLimit = roundMoney(defaultIfNull(finance.getDailyLimit(), DEFAULT_DAILY_LIMIT));

        for (LocalDate cursor = startDate; !cursor.isAfter(today); cursor = cursor.plusDays(1)) {
            double spentAmount = roundMoney(spentByDate.getOrDefault(cursor, 0.0));
            DailyComputationResult result = applyDailyRules(cursor, spentAmount, dailyLimit, currentBuffer, currentSavings, finance.getUserId(), cursor.isBefore(today));
            rebuiltRecords.add(result.record());
            currentBuffer = result.record().getBufferAfter();
            currentSavings = result.record().getSavingsAfter();
        }

        financeDailyRecordRepository.deleteByUserId(finance.getUserId());
        if (!rebuiltRecords.isEmpty()) {
            financeDailyRecordRepository.saveAll(rebuiltRecords);
        }

        finance.setDailyLimit(dailyLimit);
        finance.setTrackingStartDate(startDate);
        finance.setBuffer(roundMoney(currentBuffer));
        finance.setSavings(roundMoney(currentSavings));
        finance.setLastProcessedDate(today);
        userFinanceRepository.save(finance);

        double todaySpent = roundMoney(spentByDate.getOrDefault(today, 0.0));
        double todayDifference = roundMoney(dailyLimit - todaySpent);
        List<FinanceDailyRecord> recentRecords = rebuiltRecords.stream()
                .sorted(Comparator.comparing(FinanceDailyRecord::getDate).reversed())
                .limit(RECENT_RECORD_LIMIT)
                .toList();

        return buildResponse(finance, todaySpent, todayDifference, recentRecords);
    }

    private Map<LocalDate, Double> loadSpentByDate(String userId) {
        Map<LocalDate, Double> spentByDate = new LinkedHashMap<>();
        expenseRepository.findByUserId(userId).stream()
                .filter(expense -> expense.getDate() != null && expense.getAmount() != null)
                .sorted(Comparator.comparing(Expense::getDate))
                .forEach(expense -> spentByDate.merge(expense.getDate(), expense.getAmount(), Double::sum));

        spentByDate.replaceAll((date, amount) -> roundMoney(amount));
        return spentByDate;
    }

    private DailyComputationResult applyDailyRules(
            LocalDate date,
            double spentAmount,
            double dailyLimit,
            double currentBuffer,
            double currentSavings,
            String userId,
            boolean applyGains
    ) {
        FinanceDailyRecord record = new FinanceDailyRecord();
        record.setUserId(userId);
        record.setDate(date);
        record.setSpentAmount(roundMoney(spentAmount));
        record.setDailyLimit(roundMoney(dailyLimit));

        if (spentAmount <= dailyLimit) {
            // Unused money: only commit gains to reserves if the day is finalized (past).
            // This prevents the buffer from "shrinking" as you spend within your limit today.
            double leftover = roundMoney(dailyLimit - spentAmount);
            double bufferGain = applyGains ? roundMoney(leftover / 2.0) : 0.0;
            double savingsGain = applyGains ? roundMoney(leftover - bufferGain) : 0.0;

            record.setLeftoverAmount(leftover);
            record.setExtraAmount(0.0);
            record.setBufferChange(bufferGain);
            record.setSavingsChange(savingsGain);
            record.setBufferAfter(roundMoney(currentBuffer + bufferGain));
            record.setSavingsAfter(roundMoney(currentSavings + savingsGain));

            return new DailyComputationResult(record, roundMoney(leftover));
        }

        // Overspending drains reserves immediately.
        double extra = roundMoney(spentAmount - dailyLimit);
        double bufferUsed = Math.min(currentBuffer, extra);
        double remainingAfterBuffer = roundMoney(extra - bufferUsed);
        double savingsUsed = remainingAfterBuffer;

        record.setLeftoverAmount(0.0);
        record.setExtraAmount(extra);
        record.setBufferChange(roundMoney(-bufferUsed));
        record.setSavingsChange(roundMoney(-savingsUsed));
        record.setBufferAfter(roundMoney(Math.max(0.0, currentBuffer - bufferUsed)));
        record.setSavingsAfter(roundMoney(currentSavings - savingsUsed));

        return new DailyComputationResult(record, roundMoney(-extra));
    }

    private FinanceResponse buildResponse(
            UserFinance finance,
            Double todaySpent,
            Double todayDifference,
            List<FinanceDailyRecord> recentRecords
    ) {
        return new FinanceResponse(
                finance.getUserId(),
                roundMoney(defaultIfNull(finance.getDailyLimit(), DEFAULT_DAILY_LIMIT)),
                roundMoney(defaultIfNull(finance.getStartingBuffer(), 0.0)),
                roundMoney(defaultIfNull(finance.getStartingSavings(), 0.0)),
                roundMoney(defaultIfNull(finance.getBuffer(), 0.0)),
                roundMoney(defaultIfNull(finance.getSavings(), 0.0)),
                finance.getTrackingStartDate(),
                finance.getLastProcessedDate(),
                roundMoney(defaultIfNull(todaySpent, 0.0)),
                roundMoney(defaultIfNull(todayDifference, 0.0)),
                recentRecords.stream().map(this::toRecordResponse).toList()
        );
    }

    private FinanceDailyRecordResponse toRecordResponse(FinanceDailyRecord record) {
        return new FinanceDailyRecordResponse(
                record.getDate(),
                roundMoney(defaultIfNull(record.getSpentAmount(), 0.0)),
                roundMoney(defaultIfNull(record.getDailyLimit(), DEFAULT_DAILY_LIMIT)),
                roundMoney(defaultIfNull(record.getLeftoverAmount(), 0.0)),
                roundMoney(defaultIfNull(record.getExtraAmount(), 0.0)),
                roundMoney(defaultIfNull(record.getBufferChange(), 0.0)),
                roundMoney(defaultIfNull(record.getSavingsChange(), 0.0)),
                roundMoney(defaultIfNull(record.getBufferAfter(), 0.0)),
                roundMoney(defaultIfNull(record.getSavingsAfter(), 0.0))
        );
    }

    private UserFinance getOrCreateFinance(String userId) {
        List<UserFinance> finances = userFinanceRepository.findAllByUserId(userId);
        if (finances.isEmpty()) {
            return userFinanceRepository.save(buildDefaultFinance(userId));
        }

        if (finances.size() == 1) {
            return finances.get(0);
        }

        // Recover from duplicate finance documents by merging them into one canonical record.
        UserFinance canonical = finances.stream()
                .sorted(Comparator.comparing(
                        UserFinance::getLastProcessedDate,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ).thenComparing(
                        UserFinance::getTrackingStartDate,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .findFirst()
                .orElse(finances.get(0));

        LocalDate earliestTrackingStart = finances.stream()
                .map(UserFinance::getTrackingStartDate)
                .filter(date -> date != null)
                .min(LocalDate::compareTo)
                .orElseGet(() -> resolveDefaultTrackingStartDate(userId));

        canonical.setUserId(userId);
        canonical.setDailyLimit(roundMoney(firstNonNull(finances.stream().map(UserFinance::getDailyLimit).toList(), DEFAULT_DAILY_LIMIT)));
        canonical.setStartingBuffer(roundMoney(firstNonNull(finances.stream().map(UserFinance::getStartingBuffer).toList(), 0.0)));
        canonical.setStartingSavings(roundMoney(firstNonNull(finances.stream().map(UserFinance::getStartingSavings).toList(), 0.0)));
        canonical.setTrackingStartDate(earliestTrackingStart);

        List<UserFinance> duplicates = finances.stream()
                .filter(finance -> canonical.getId() == null || !canonical.getId().equals(finance.getId()))
                .toList();

        if (!duplicates.isEmpty()) {
            userFinanceRepository.deleteAll(duplicates);
        }

        return userFinanceRepository.save(canonical);
    }

    private UserFinance buildDefaultFinance(String userId) {
        UserFinance finance = new UserFinance();
        finance.setUserId(userId);
        finance.setDailyLimit(DEFAULT_DAILY_LIMIT);
        finance.setStartingBuffer(0.0);
        finance.setStartingSavings(0.0);
        finance.setBuffer(0.0);
        finance.setSavings(0.0);
        finance.setTrackingStartDate(resolveDefaultTrackingStartDate(userId));
        finance.setLastProcessedDate(finance.getTrackingStartDate());
        return finance;
    }

    private LocalDate resolveDefaultTrackingStartDate(String userId) {
        return expenseRepository.findByUserId(userId).stream()
                .map(Expense::getDate)
                .filter(date -> date != null)
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());
    }

    private void validateSettings(FinanceSettingsRequest request) {
        if (request.startingBuffer() != null && request.startingBuffer() < 0) {
            throw new IllegalArgumentException("startingBuffer cannot be negative");
        }
        if (request.trackingStartDate() != null && request.trackingStartDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("trackingStartDate cannot be in the future");
        }
    }

    private String requireUserId(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("userId is required");
        }
        return userId.trim().toLowerCase(Locale.ROOT).equals(userId.trim().toLowerCase(Locale.ROOT))
                ? userId.trim()
                : userId.trim();
    }

    private double defaultIfNull(Double value, double defaultValue) {
        return value != null ? value : defaultValue;
    }

    private double firstNonNull(List<Double> values, double defaultValue) {
        return values.stream()
                .filter(value -> value != null)
                .findFirst()
                .orElse(defaultValue);
    }

    private double roundMoney(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private record DailyComputationResult(FinanceDailyRecord record, double difference) {
    }

    public record FinanceSnapshot(
            Double dailyLimit,
            Double buffer,
            Double savings,
            Double todaySpent,
            Double todayDifference,
            LocalDate trackingStartDate,
            LocalDate lastProcessedDate
    ) {
    }
}
