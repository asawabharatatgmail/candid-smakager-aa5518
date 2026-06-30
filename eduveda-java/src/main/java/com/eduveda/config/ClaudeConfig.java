package com.eduveda.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class ClaudeConfig {

    @Value("${anthropic.api-key}")
    private String apiKey;

    @Value("${anthropic.api-url}")
    private String apiUrl;

    @Value("${anthropic.api-version}")
    private String apiVersion;

    @Value("${anthropic.model}")
    private String model;

    @Bean("claudeWebClient")
    public WebClient claudeWebClient() {
        return WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", apiVersion)
                .defaultHeader("content-type", "application/json")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    public String getModel() { return model; }
    public String getApiKey() { return apiKey; }
}
