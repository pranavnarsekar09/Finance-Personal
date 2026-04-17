package com.personalproject.tracker.food;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalproject.tracker.config.AppProperties;
import com.personalproject.tracker.food.dto.AnalyzeFoodRequest;
import com.personalproject.tracker.food.dto.FoodAnalysisResponse;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Base64;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Component
public class GeminiClient {

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={apiKey}";

    private final AppProperties appProperties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiClient(AppProperties appProperties, ObjectMapper objectMapper) {
        this.appProperties = appProperties;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public FoodAnalysisResponse analyze(AnalyzeFoodRequest request) {
        if (!StringUtils.hasText(appProperties.ai().geminiApiKey())) {
            return fallbackResponse(request, "Error: API key is missing or empty!");
        }

        String prompt = """
                Analyze this meal image.
                User note: %s
                Return strict JSON with keys:
                foodName, calories, protein, carbs, fat, estimatedCost
                Use numeric values only for nutrition and cost. If you can't tell, provide reasonable estimates.
                """.formatted(request.note() == null ? "" : request.note());

        String mimeType = "image/jpeg";
        String base64Data = null;
        String imageUrl = request.imageUrl();

        if (StringUtils.hasText(imageUrl)) {
            if (imageUrl.startsWith("data:")) {
                int commaIndex = imageUrl.indexOf(',');
                if (commaIndex != -1) {
                    String meta = imageUrl.substring(5, commaIndex);
                    if (meta.contains(";")) {
                        mimeType = meta.split(";")[0];
                    } else {
                        mimeType = meta;
                    }
                    base64Data = imageUrl.substring(commaIndex + 1);
                }
            } else if (imageUrl.startsWith("http")) {
                try {
                    var response = restClient.get().uri(imageUrl).retrieve().toEntity(byte[].class);
                    byte[] bytes = response.getBody();
                    if (bytes != null) {
                        if (response.getHeaders().getContentType() != null) {
                            mimeType = response.getHeaders().getContentType().toString();
                        }
                        base64Data = Base64.getEncoder().encodeToString(bytes);
                    }
                } catch (Exception e) {
                    // Ignore and proceed without image
                }
            }
        }

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        if (StringUtils.hasText(base64Data)) {
            parts.add(Map.of("inlineData", Map.of(
                    "mimeType", mimeType,
                    "data", base64Data
            )));
        }

        Map<String, Object> body = Map.of(
                "contents", new Object[]{
                        Map.of("parts", parts)
                }
        );

        try {
            String url = GEMINI_URL.replace("{apiKey}", appProperties.ai().geminiApiKey().trim());
            String responseBody = restClient.post()
                    .uri(java.net.URI.create(url))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseBody);
            String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText().trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            } else if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            JsonNode parsed = objectMapper.readTree(text.trim());

            return new FoodAnalysisResponse(
                    request.imageUrl(),
                    parsed.path("foodName").asText("Meal"),
                    parsed.path("calories").asDouble(0),
                    parsed.path("protein").asDouble(0),
                    parsed.path("carbs").asDouble(0),
                    parsed.path("fat").asDouble(0),
                    parsed.path("estimatedCost").asDouble(0),
                    request.note(),
                    "gemini"
            );
        } catch (Exception exception) {
            System.err.println("Gemini error: " + exception.getMessage());
            exception.printStackTrace();
            return fallbackResponse(request, "Error: " + exception.getMessage());
        }
    }

    public String generateInsight(String prompt) {
        if (!StringUtils.hasText(appProperties.ai().geminiApiKey())) {
            return null;
        }

        Map<String, Object> body = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                }
        );

        try {
            String url = GEMINI_URL.replace("{apiKey}", appProperties.ai().geminiApiKey().trim());
            String responseBody = restClient.post()
                    .uri(java.net.URI.create(url))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseBody);
            String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText().trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            } else if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            return text.trim();
        } catch (Exception exception) {
            System.err.println("Gemini insight error: " + exception.getMessage());
            return null;
        }
    }

    private FoodAnalysisResponse fallbackResponse(AnalyzeFoodRequest request, String source) {
        String normalized = (request.note() == null ? "" : request.note()).toLowerCase();
        String foodName = source.startsWith("Error:") ? source : (normalized.contains("breakfast") ? "Breakfast Meal"
                : normalized.contains("lunch") ? "Lunch Meal"
                : normalized.contains("dinner") ? "Dinner Meal"
                : "Logged Meal");

        return new FoodAnalysisResponse(
                request.imageUrl(),
                foodName,
                520.0,
                24.0,
                58.0,
                18.0,
                180.0,
                request.note(),
                source
        );
    }
}
