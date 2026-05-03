package com.personalproject.tracker.keepalive;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class KeepAliveService {

    private static final Logger LOGGER = Logger.getLogger(KeepAliveService.class.getName());
    private final HttpClient httpClient;
    private final URI pingUri;
    private final boolean enabled;

    public KeepAliveService(
            @Value("${server.port:8080}") int port,
            @Value("${keepalive.path:/api/health}") String path,
            @Value("${keepalive.target-url:}") String targetUrl,
            @Value("${keepalive.enabled:true}") boolean enabled) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        this.enabled = enabled;
        this.pingUri = StringUtils.hasText(targetUrl)
                ? URI.create(targetUrl.trim())
                : URI.create("http://127.0.0.1:" + port + path);
    }

    @Scheduled(initialDelayString = "PT30S", fixedDelayString = "PT5M")
    public void pingBackend() {
        if (!enabled) {
            return;
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(pingUri)
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            LOGGER.info("Keep-alive ping succeeded: " + response.statusCode());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            LOGGER.log(Level.WARNING, "Keep-alive ping failed", ex);
        } catch (IOException ex) {
            LOGGER.log(Level.WARNING, "Keep-alive ping failed", ex);
        }
    }
}
