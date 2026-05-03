package com.personalproject.tracker.finance;

import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "finance_daily_records")
@CompoundIndex(name = "finance_user_date_idx", def = "{'userId': 1, 'date': 1}", unique = true)
public class FinanceDailyRecord {

    @Id
    private String id;

    @Indexed
    private String userId;

    private LocalDate date;
    private Double spentAmount;
    private Double dailyLimit;
    private Double leftoverAmount;
    private Double extraAmount;
    private Double bufferChange;
    private Double savingsChange;
    private Double bufferAfter;
    private Double savingsAfter;

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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getSpentAmount() {
        return spentAmount;
    }

    public void setSpentAmount(Double spentAmount) {
        this.spentAmount = spentAmount;
    }

    public Double getDailyLimit() {
        return dailyLimit;
    }

    public void setDailyLimit(Double dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    public Double getLeftoverAmount() {
        return leftoverAmount;
    }

    public void setLeftoverAmount(Double leftoverAmount) {
        this.leftoverAmount = leftoverAmount;
    }

    public Double getExtraAmount() {
        return extraAmount;
    }

    public void setExtraAmount(Double extraAmount) {
        this.extraAmount = extraAmount;
    }

    public Double getBufferChange() {
        return bufferChange;
    }

    public void setBufferChange(Double bufferChange) {
        this.bufferChange = bufferChange;
    }

    public Double getSavingsChange() {
        return savingsChange;
    }

    public void setSavingsChange(Double savingsChange) {
        this.savingsChange = savingsChange;
    }

    public Double getBufferAfter() {
        return bufferAfter;
    }

    public void setBufferAfter(Double bufferAfter) {
        this.bufferAfter = bufferAfter;
    }

    public Double getSavingsAfter() {
        return savingsAfter;
    }

    public void setSavingsAfter(Double savingsAfter) {
        this.savingsAfter = savingsAfter;
    }
}
