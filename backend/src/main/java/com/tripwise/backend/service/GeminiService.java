package com.tripwise.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripwise.backend.dto.ItineraryResponse;
import com.tripwise.backend.entity.Trip;
import com.tripwise.backend.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GeminiService(
            @Value("${app.ai.api-key:}") String apiKey,
            @Value("${app.ai.model:openrouter/free}") String model,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = (model != null && !model.isBlank()) ? model : "openrouter/free";
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public ItineraryResponse generateItinerary(Trip trip) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException(
                    "OpenRouter API key is not configured. Please set the TRIPWISE_OPENROUTER_API_KEY environment variable.");
        }

        long numDays = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
        if (numDays <= 0) {
            numDays = 1;
        }

        String prompt = buildPrompt(trip, numDays);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", "You are a professional travel planner AI. Return ONLY valid JSON with no markdown, no code fences, and no commentary."
            );
            Map<String, Object> userMessage = Map.of(
                    "role", "user",
                    "content", prompt
            );

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(systemMessage, userMessage),
                    "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(OPENROUTER_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseOpenRouterResponse(response.getBody());
            } else {
                throw new BadRequestException(
                        "Failed to generate itinerary from AI service. Status: " + response.getStatusCode());
            }

        } catch (HttpStatusCodeException e) {
            int status = e.getStatusCode().value();
            logger.error("OpenRouter API call failed with HTTP {}", status);
            String userMessage;
            if (status == 401) {
                userMessage = "AI service authentication failed. Check that TRIPWISE_OPENROUTER_API_KEY is correct.";
            } else if (status == 429) {
                userMessage = "AI service rate limit reached. Please wait a moment and try again.";
            } else if (status >= 500) {
                userMessage = "AI provider is temporarily unavailable (HTTP " + status + "). Please try again shortly.";
            } else {
                userMessage = "AI service error (HTTP " + status + "). Failed to generate itinerary.";
            }
            throw new BadRequestException(userMessage);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error invoking OpenRouter API: {}", e.getMessage());
            throw new BadRequestException("Failed to generate itinerary: " + e.getMessage());
        }
    }

    private String buildPrompt(Trip trip, long numDays) {
        return String.format("""
            You are a professional travel planner AI. Create a personalized day-by-day itinerary for the following trip:
            - Destination: %s
            - Start Date: %s
            - End Date: %s
            - Number of Days: %d
            - Travelers: %d
            - Total Budget: $%.2f USD
            - Travel Style / Preferences: %s

            REQUIREMENTS:
            1. Generate EXACTLY %d itinerary days starting from date %s up to %s.
            2. For each day, include:
               - day: integer (1 to %d)
               - date: string format "YYYY-MM-DD" matching the trip date for that day
               - morning: activity name (string), description (string), estimatedCost (number in USD)
               - afternoon: activity name (string), description (string), estimatedCost (number in USD)
               - evening: activity name (string), description (string), estimatedCost (number in USD)
               - tip: practical travel tip for that day (string)
            3. Return ONLY valid JSON adhering to the following structure:
            {
              "destination": "%s",
              "days": [
                {
                  "day": 1,
                  "date": "%s",
                  "morning": {
                    "activity": "...",
                    "description": "...",
                    "estimatedCost": 15.0
                  },
                  "afternoon": {
                    "activity": "...",
                    "description": "...",
                    "estimatedCost": 25.0
                  },
                  "evening": {
                    "activity": "...",
                    "description": "...",
                    "estimatedCost": 40.0
                  },
                  "tip": "..."
                }
              ]
            }
            Do NOT wrap in markdown or extra commentary. Return valid JSON only.
            """,
                trip.getDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                numDays,
                trip.getTravelers(),
                trip.getBudget(),
                trip.getTravelStyle() != null ? trip.getTravelStyle() : "General",
                numDays,
                trip.getStartDate(),
                trip.getEndDate(),
                numDays,
                trip.getDestination(),
                trip.getStartDate()
        );
    }

    private ItineraryResponse parseOpenRouterResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);

            // OpenAI-compatible response: choices[0].message.content
            JsonNode choices = root.path("choices");
            if (choices.isEmpty()) {
                throw new BadRequestException("AI service returned no choices in the response.");
            }

            String jsonText = choices.get(0).path("message").path("content").asText();

            if (jsonText == null || jsonText.isBlank()) {
                throw new BadRequestException("AI service returned empty content.");
            }

            // Sanitize markdown code fences if the model wraps output despite instructions
            jsonText = jsonText.trim();
            if (jsonText.startsWith("```json")) {
                jsonText = jsonText.substring(7);
            } else if (jsonText.startsWith("```")) {
                jsonText = jsonText.substring(3);
            }
            if (jsonText.endsWith("```")) {
                jsonText = jsonText.substring(0, jsonText.length() - 3);
            }
            jsonText = jsonText.trim();

            return objectMapper.readValue(jsonText, ItineraryResponse.class);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to parse OpenRouter response JSON: {}", e.getMessage());
            throw new BadRequestException("Failed to parse response from AI service. The response was malformed.");
        }
    }

    public String askAssistant(Trip trip, ItineraryResponse itinerary, String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException(
                    "OpenRouter API key is not configured. Please set the TRIPWISE_OPENROUTER_API_KEY environment variable.");
        }

        String contextPrompt = buildAssistantContextPrompt(trip, itinerary);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            String systemInstruction = """
                You are TripWise AI, a travel assistant.
                Answer using the provided current-trip context.
                Do not invent facts about the user's trip.
                If the information is unavailable, say so.
                Give practical, concise travel advice.
                When discussing costs, use the trip's budget/currency context when available.
                """;

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", systemInstruction + "\n\n" + contextPrompt
            );
            Map<String, Object> userMsg = Map.of(
                    "role", "user",
                    "content", userMessage
            );

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(systemMessage, userMsg),
                    "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(OPENROUTER_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseAssistantResponse(response.getBody());
            } else {
                throw new BadRequestException(
                        "Failed to get reply from AI assistant service. Status: " + response.getStatusCode());
            }

        } catch (HttpStatusCodeException e) {
            int status = e.getStatusCode().value();
            logger.error("OpenRouter API assistant call failed with HTTP {}", status);
            String userError;
            if (status == 401) {
                userError = "AI service authentication failed. Check that TRIPWISE_OPENROUTER_API_KEY is correct.";
            } else if (status == 429) {
                userError = "AI service rate limit reached. Please wait a moment and try again.";
            } else if (status >= 500) {
                userError = "AI provider is temporarily unavailable. Please try again shortly.";
            } else {
                userError = "AI service error. Unable to answer question at this time.";
            }
            throw new BadRequestException(userError);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error invoking OpenRouter API for assistant: {}", e.getMessage());
            throw new BadRequestException("Failed to process assistant request: " + e.getMessage());
        }
    }

    private String buildAssistantContextPrompt(Trip trip, ItineraryResponse itinerary) {
        StringBuilder sb = new StringBuilder();
        sb.append("CURRENT TRIP CONTEXT:\n");
        sb.append("- Destination: ").append(trip.getDestination()).append("\n");
        sb.append("- Start Date: ").append(trip.getStartDate()).append("\n");
        sb.append("- End Date: ").append(trip.getEndDate()).append("\n");
        sb.append("- Travelers: ").append(trip.getTravelers()).append("\n");
        sb.append("- Budget: $").append(String.format("%.2f", trip.getBudget())).append(" USD\n");
        sb.append("- Travel Style / Preferences: ").append(trip.getTravelStyle() != null ? trip.getTravelStyle() : "General").append("\n");

        if (itinerary != null && itinerary.getDays() != null && !itinerary.getDays().isEmpty()) {
            sb.append("\nSAVED ITINERARY:\n");
            for (com.tripwise.backend.dto.ItineraryDayResponse day : itinerary.getDays()) {
                sb.append(String.format("Day %d (%s):\n", day.getDay(), day.getDate() != null ? day.getDate() : "N/A"));
                if (day.getMorning() != null) {
                    sb.append("  - Morning: ").append(day.getMorning().getActivity())
                            .append(" (").append(day.getMorning().getDescription()).append(")")
                            .append(" [Est Cost: $").append(day.getMorning().getEstimatedCost()).append("]\n");
                }
                if (day.getAfternoon() != null) {
                    sb.append("  - Afternoon: ").append(day.getAfternoon().getActivity())
                            .append(" (").append(day.getAfternoon().getDescription()).append(")")
                            .append(" [Est Cost: $").append(day.getAfternoon().getEstimatedCost()).append("]\n");
                }
                if (day.getEvening() != null) {
                    sb.append("  - Evening: ").append(day.getEvening().getActivity())
                            .append(" (").append(day.getEvening().getDescription()).append(")")
                            .append(" [Est Cost: $").append(day.getEvening().getEstimatedCost()).append("]\n");
                }
                if (day.getTip() != null && !day.getTip().isBlank()) {
                    sb.append("  - Practical Tip: ").append(day.getTip()).append("\n");
                }
            }
        } else {
            sb.append("\nSAVED ITINERARY: No itinerary has been generated yet for this trip.\n");
        }

        return sb.toString();
    }

    private String parseAssistantResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            if (choices.isEmpty()) {
                throw new BadRequestException("AI service returned no response choices.");
            }

            String reply = choices.get(0).path("message").path("content").asText();
            if (reply == null || reply.isBlank()) {
                throw new BadRequestException("AI service returned empty response.");
            }

            return reply.trim();
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to parse OpenRouter assistant response: {}", e.getMessage());
            throw new BadRequestException("Failed to parse response from AI assistant.");
        }
    }
}
