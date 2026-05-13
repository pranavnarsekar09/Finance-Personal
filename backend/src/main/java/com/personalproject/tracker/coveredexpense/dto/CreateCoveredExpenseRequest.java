package com.personalproject.tracker.coveredexpense.dto;

import java.time.LocalDate;

public class CreateCoveredExpenseRequest {
    private String userId;
    private String name;
    private Double amount;
    private String whoCovers;
    private String frequency;
    private LocalDate nextDueDate;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getWhoCovers() { return whoCovers; }
    public void setWhoCovers(String whoCovers) { this.whoCovers = whoCovers; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public LocalDate getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(LocalDate nextDueDate) { this.nextDueDate = nextDueDate; }
}