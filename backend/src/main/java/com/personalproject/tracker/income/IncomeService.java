package com.personalproject.tracker.income;

import com.personalproject.tracker.common.ResourceNotFoundException;
import com.personalproject.tracker.income.dto.CreateIncomeRequest;
import com.personalproject.tracker.income.dto.IncomeResponse;
import com.personalproject.tracker.profile.ProfileRepository;
import com.personalproject.tracker.profile.UserProfile;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final ProfileRepository profileRepository;

    public IncomeService(IncomeRepository incomeRepository, ProfileRepository profileRepository) {
        this.incomeRepository = incomeRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public IncomeResponse createIncome(CreateIncomeRequest request) {
        Income income = new Income();
        income.setUserId(request.userId());
        income.setAmount(request.amount());
        income.setSource(request.source());
        income.setNote(request.note());
        income.setDate(request.date());
        income.setRecurring(request.isRecurring());
        income.setCreatedAt(Instant.now());

        Income saved = incomeRepository.save(income);

        // Update profile balance and budget
        updateProfileBalance(request.userId(), request.amount());

        return toResponse(saved);
    }

    public List<IncomeResponse> getIncomes(String userId, LocalDate start, LocalDate end) {
        List<Income> incomes;
        if (start != null && end != null) {
            incomes = incomeRepository.findByUserIdAndDateBetween(userId, start, end);
        } else {
            incomes = incomeRepository.findByUserId(userId);
        }
        return incomes.stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteIncome(String id) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income record not found"));
        
        // Deduct from profile balance and budget (reverse the addition)
        updateProfileBalance(income.getUserId(), -income.getAmount());
        
        incomeRepository.delete(income);
    }

    private void updateProfileBalance(String userId, double delta) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        
        double currentBalance = profile.getAvailableBalance() != null ? profile.getAvailableBalance() : 0.0;
        double currentBudget = profile.getMonthlyBudget() != null ? profile.getMonthlyBudget() : 0.0;
        
        profile.setAvailableBalance(currentBalance + delta);
        profile.setMonthlyBudget(currentBudget + delta);
        
        profileRepository.save(profile);
    }

    private IncomeResponse toResponse(Income income) {
        return new IncomeResponse(
                income.getId(),
                income.getUserId(),
                income.getAmount(),
                income.getSource(),
                income.getNote(),
                income.getDate(),
                income.isRecurring(),
                income.getCreatedAt()
        );
    }
}
