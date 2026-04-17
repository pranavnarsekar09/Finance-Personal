package com.personalproject.tracker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String corsOrigin,
        AiProperties ai
) {
    public record AiProperties(String geminiApiKey) {
    }
}
