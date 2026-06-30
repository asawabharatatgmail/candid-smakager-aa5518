package com.eduveda.service;

import com.eduveda.config.ClaudeConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

/**
 * Claude AI service — all AI features powered by Anthropic Claude.
 * Uses prompt caching (cache_control: ephemeral) on long system prompts
 * to reduce latency and cost for repeated calls.
 */
@Service
public class ClaudeAiService {

    private final WebClient claudeWebClient;
    private final ClaudeConfig claudeConfig;
    private final ObjectMapper objectMapper;

    public ClaudeAiService(@Qualifier("claudeWebClient") WebClient claudeWebClient,
                           ClaudeConfig claudeConfig,
                           ObjectMapper objectMapper) {
        this.claudeWebClient = claudeWebClient;
        this.claudeConfig = claudeConfig;
        this.objectMapper = objectMapper;
    }

    // ─── Core request builder ────────────────────────────────────────────────

    private ObjectNode buildRequest(String userPrompt, int maxTokens, Double temperature) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", claudeConfig.getModel());
        body.put("max_tokens", maxTokens);
        if (temperature != null) body.put("temperature", temperature);

        ArrayNode messages = objectMapper.createArrayNode();
        ObjectNode userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userPrompt);
        messages.add(userMsg);
        body.set("messages", messages);
        return body;
    }

    private ObjectNode buildRequestWithSystem(String systemPrompt, String userPrompt, int maxTokens, boolean cacheSystem) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", claudeConfig.getModel());
        body.put("max_tokens", maxTokens);

        if (cacheSystem) {
            // Use prompt caching for repeated system instructions
            ArrayNode system = objectMapper.createArrayNode();
            ObjectNode sysBlock = objectMapper.createObjectNode();
            sysBlock.put("type", "text");
            sysBlock.put("text", systemPrompt);
            ObjectNode cacheControl = objectMapper.createObjectNode();
            cacheControl.put("type", "ephemeral");
            sysBlock.set("cache_control", cacheControl);
            system.add(sysBlock);
            body.set("system", system);
        } else {
            body.put("system", systemPrompt);
        }

        ArrayNode messages = objectMapper.createArrayNode();
        ObjectNode userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userPrompt);
        messages.add(userMsg);
        body.set("messages", messages);
        return body;
    }

    private String callClaude(ObjectNode requestBody) {
        return claudeWebClient.post()
                .uri("/v1/messages")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(resp -> resp.at("/content/0/text").asText())
                .block();
    }

    // ─── Quiz Generation ─────────────────────────────────────────────────────

    public JsonNode generateQuiz(String topic, int numQuestions, String difficulty, String quizType) throws Exception {
        boolean isTF = "True / False".equals(quizType);
        String optionsNote = isTF ? "Each question must have exactly 2 options: ['True', 'False']." : "Each question must have exactly 4 options.";

        String prompt = String.format("""
            Generate a %s quiz with %d questions on the topic "%s".
            Difficulty level: %s.
            %s

            Return ONLY valid JSON with this structure:
            {"quizTitle":"...","questions":[{"questionText":"...","options":["A","B","C","D"],"correctAnswerIndex":0}]}
            """, quizType, numQuestions, topic, difficulty, optionsNote);

        String response = callClaude(buildRequest(prompt, 4096, null));
        return objectMapper.readTree(response);
    }

    // ─── Flashcard Generation ────────────────────────────────────────────────

    public JsonNode generateFlashcards(String topic, int numFlashcards) throws Exception {
        String prompt = String.format("""
            Generate %d educational flashcards on the topic "%s".
            Each flashcard has a front (term/question) and back (definition/answer).

            Return ONLY valid JSON:
            {"title":"...","flashcards":[{"front":"...","back":"..."}]}
            """, numFlashcards, topic);

        String response = callClaude(buildRequest(prompt, 4096, null));
        return objectMapper.readTree(response);
    }

    // ─── Study Material Generation ───────────────────────────────────────────

    public JsonNode generateStudyMaterial(String topic, String gradeLevel, String difficulty) throws Exception {
        String prompt = String.format("""
            Generate a detailed study guide on "%s" for a %s student at %s difficulty.
            Use markdown formatting with headings, bullet points, and bold text.

            Return ONLY valid JSON:
            {"title":"...","content":"Full markdown content..."}
            """, topic, gradeLevel, difficulty);

        String response = callClaude(buildRequest(prompt, 8192, null));
        return objectMapper.readTree(response);
    }

    // ─── AI Schedule Generator ───────────────────────────────────────────────

    public JsonNode generateSchedule(String classesJson, String teachersJson, String subjectsJson, String rulesText) throws Exception {
        String prompt = String.format("""
            You are an expert school scheduler. Create a weekly class schedule.
            Schedule Monday-Friday, 09:00-16:00. Each lecture is 1 hour. Lunch break: 12:00-13:00 (no lectures).

            Classes: %s
            Teachers: %s
            Subjects: %s
            Rules:
            %s

            Hard constraints:
            - Teacher teaches one class at a time
            - Class has one lecture at a time
            - Teacher must be qualified for the subject

            Return ONLY a JSON array:
            [{"day":"Monday","startTime":"09:00","endTime":"10:00","classId":"...","subjectId":"...","teacherId":"..."}]
            """, classesJson, teachersJson, subjectsJson, rulesText);

        String response = callClaude(buildRequest(prompt, 8192, 0.3));
        // Extract JSON array from response
        String text = response.trim();
        int start = text.indexOf('[');
        int end = text.lastIndexOf(']') + 1;
        return objectMapper.readTree(text.substring(start, end));
    }

    // ─── Lead Analytics ───────────────────────────────────────────────────────

    public JsonNode generateLeadSummary(String leadsDataString, int totalLeads) throws Exception {
        String prompt = String.format("""
            You are an expert CRM analyst for an educational institute.
            Analyze this lead data: %s
            Total Leads: %d

            Return ONLY valid JSON:
            {"overallSummary":"...","statusBreakdown":[{"status":"New","count":0,"percentage":0.0}],"conversionRate":0.0,"topPerformingSource":{"source":"...","qualifiedLeads":0,"comment":"..."},"actionableSuggestions":["..."],"keyHighlight":"..."}
            """, leadsDataString, totalLeads);

        String response = callClaude(buildRequest(prompt, 2048, 0.3));
        return objectMapper.readTree(response);
    }

    // ─── Email Generator ─────────────────────────────────────────────────────

    public JsonNode generateEmailForLead(String leadName, String leadStatus, String purpose) throws Exception {
        String prompt = String.format("""
            Generate a professional email for a sales lead at an educational institute.
            Lead: Name=%s, Status=%s
            Purpose: %s
            Address the lead by first name. Be encouraging and helpful.

            Return ONLY valid JSON:
            {"subject":"...","body":"Full email body with \\n for line breaks"}
            """, leadName, leadStatus, purpose);

        String response = callClaude(buildRequest(prompt, 1024, null));
        return objectMapper.readTree(response);
    }

    // ─── Game Level Generator ─────────────────────────────────────────────────

    public JsonNode generateGameLevels(String topic, int numLevels, int questionsPerLevel) throws Exception {
        String prompt = String.format("""
            Generate a gamified challenge with %d progressively harder levels on "%s".
            Each level has exactly %d MCQ questions with 4 options.

            Return ONLY valid JSON array:
            [{"levelNumber":1,"questions":[{"questionText":"...","options":["A","B","C","D"],"correctAnswerIndex":0}]}]
            """, numLevels, topic, questionsPerLevel);

        String response = callClaude(buildRequest(prompt, 8192, null));
        String text = response.trim();
        int start = text.indexOf('[');
        int end = text.lastIndexOf(']') + 1;
        return objectMapper.readTree(text.substring(start, end));
    }

    // ─── Thought of the Day ───────────────────────────────────────────────────

    public String generateQuote() {
        String prompt = "Generate a short unique inspirational thought of the day for a student. Include author if known, else 'Anonymous'. Format: 'The quote.' - Author";
        ObjectNode body = buildRequest(prompt, 200, 1.0);
        return callClaude(body).trim();
    }

    // ─── Personalized Insight ─────────────────────────────────────────────────

    public String generatePersonalizedInsight(String role) {
        Map<String, String> prompts = Map.of(
            "Teacher", "You are an expert instructional designer. Give a short actionable tip (2-3 sentences) for a teacher on using quizzes or flashcards to reinforce a complex topic. Be encouraging and professional.",
            "Student", "You are a friendly study coach. Give a short motivational study tip (2-3 sentences) for a student. Suggest the Feynman technique or spaced repetition. Be encouraging and positive.",
            "Class Admin", "You are a strategic educational consultant. Give a short insightful suggestion (2-3 sentences) for an administrator on using data to improve student outcomes.",
            "Branch Admin", "You are a strategic educational consultant. Give a short insightful suggestion (2-3 sentences) for an administrator on using data to improve student outcomes.",
            "Parent", "You are a helpful AI assistant for parents. Give a short supportive tip (2-3 sentences) for a parent on engaging with their child about schoolwork."
        );
        String prompt = prompts.getOrDefault(role, "Give a motivational message for an education professional.");
        return callClaude(buildRequest(prompt, 300, 0.8)).trim();
    }

    // ─── AI Help Chatbot (streaming) ─────────────────────────────────────────

    private static final String HELP_SYSTEM = """
        You are an AI assistant for the EduVeda educational platform.
        Your role is to help users understand and use the platform features.
        Be concise and helpful. Format answers using markdown.
        Only answer questions about the platform features.
        """;

    public Flux<String> streamHelpResponse(String query, String role, String context) {
        String systemPrompt = HELP_SYSTEM + "\n\nUser Role: " + role + "\n\nPlatform Context:\n" + context;
        ObjectNode body = buildRequestWithSystem(systemPrompt, query, 1024, true);
        body.put("stream", true);

        return claudeWebClient.post()
                .uri("/v1/messages")
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .filter(chunk -> chunk.contains("\"delta\""))
                .map(chunk -> {
                    try {
                        JsonNode node = objectMapper.readTree(chunk.replace("data: ", ""));
                        return node.at("/delta/text").asText("");
                    } catch (Exception e) {
                        return "";
                    }
                })
                .filter(text -> !text.isEmpty());
    }

    // ─── AI Tutor "Veda" (streaming) ─────────────────────────────────────────

    public Flux<String> streamTutorResponse(String query, String subject) {
        String systemPrompt = String.format("""
            You are Veda, an expert AI tutor for %s.
            Help students understand concepts — guide them, don't just give answers.
            Be encouraging, friendly, patient. Use examples for high school students.
            After explaining, ask a follow-up question to check understanding.
            Use markdown formatting. Only answer %s questions.
            """, subject, subject);

        ObjectNode body = buildRequestWithSystem(systemPrompt, query, 1024, true);
        body.put("stream", true);

        return claudeWebClient.post()
                .uri("/v1/messages")
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .filter(chunk -> chunk.contains("\"delta\""))
                .map(chunk -> {
                    try {
                        JsonNode node = objectMapper.readTree(chunk.replace("data: ", ""));
                        return node.at("/delta/text").asText("");
                    } catch (Exception e) {
                        return "";
                    }
                })
                .filter(text -> !text.isEmpty());
    }

    // ─── Note Tools ───────────────────────────────────────────────────────────

    public String summarizeNote(String noteContent) {
        String prompt = "Summarize the following text into key points using markdown bullet points:\n\n---\n\n" + noteContent;
        return callClaude(buildRequest(prompt, 1024, null)).trim();
    }

    public String generateQuestionsFromNote(String noteContent) {
        String prompt = "Based on the following text, generate 3-5 study questions as a numbered markdown list:\n\n---\n\n" + noteContent;
        return callClaude(buildRequest(prompt, 1024, null)).trim();
    }

    public String explainText(String text) {
        String prompt = "Explain the following concept simply for a high school student. Use markdown if helpful:\n\n---\n\n\"" + text + "\"";
        return callClaude(buildRequest(prompt, 512, null)).trim();
    }

    // ─── Lead Form Script ────────────────────────────────────────────────────

    public JsonNode generateLeadFormScript(List<String> fields) throws Exception {
        String prompt = String.format("""
            Generate Google Apps Script code for a web lead capture form.
            Form submits to a Google Sheet named "Leads".
            Fields: %s

            Return ONLY valid JSON:
            {"Code.gs":"// Complete Apps Script backend...","Index.html":"<!-- HTML form with CSS -->"}
            """, String.join(", ", fields));

        String response = callClaude(buildRequest(prompt, 4096, null));
        return objectMapper.readTree(response);
    }
}
