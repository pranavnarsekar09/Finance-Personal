package com.personalproject.tracker.finance;

import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_finance")
public class UserFinance {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private Double dailyLimit;
    private Double startingBuffer;
    private Double startingSavings;
    private Double buffer;
    private Double savings;
    private LocalDate trackingStartDate;
    private LocalDate lastProcessedDate;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Double getDailyLimit() {
        return dailyLimit;
    }

    public void setDailyLimit(Double dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    public Double getStartingBuffer() {
        return startingBuffer;
    }

    public void setStartingBuffer(Double startingBuffer) {
        this.startingBuffer = startingBuffer;
    }

    public Double getStartingSavings() {
        return startingSavings;
    }

    public void setStartingSavings(Double startingSavings) {
        this.startingSavings = startingSavings;
    }

    public Double getBuffer() {
        return buffer;
    }

    public void setBuffer(Double buffer) {
        this.buffer = buffer;
    }

    public Double getSavings() {
        return savings;
    }

    public void setSavings(Double savings) {
        this.savings = savings;
    }

    public LocalDate getTrackingStartDate() {
        return trackingStartDate;
    }

    public void setTrackingStartDate(LocalDate trackingStartDate) {
        this.trackingStartDate = trackingStartDate;
    }

    public LocalDate getLastProcessedDate() {
        return lastProcessedDate;
    }

    public void setLastProcessedDate(LocalDate lastProcessedDate) {
        this.lastProcessedDate = lastProcessedDate;
    }
}
