package com.personalproject.tracker.coveredexpense.dto;

import java.time.Instant;
import java.time.LocalDate;

public class CoveredExpenseResponse {
    private String id;
    private String name;
    private Double amount;
    private String whoCovers;
    private String frequency;
    private String nextDueDate;
    private String createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getWhoCovers() { return whoCovers; }
    public void setWhoCovers(String whoCovers) { this.whoCovers = whoCovers; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(String nextDueDate) { this.nextDueDate = nextDueDate; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}