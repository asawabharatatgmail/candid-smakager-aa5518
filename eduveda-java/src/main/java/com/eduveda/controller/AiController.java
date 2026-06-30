package com.eduveda.controller;

import com.eduveda.dto.AiRequest;
import com.eduveda.model.Lead;
import com.eduveda.repository.LeadRepository;
import com.eduveda.service.ClaudeAiService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * All Claude AI endpoints. Streaming endpoints return text/event-stream (SSE).
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final ClaudeAiService aiService;
    private final LeadRepository leadRepository;

    public AiController(ClaudeAiService aiService, LeadRepository leadRepository) {
        this.aiService = aiService;
        this.leadRepository = leadRepository;
    }

    // ─── Quiz ────────────────────────────────────────────────────────────────

    @PostMapping("/quiz/generate")
    public ResponseEntity<?> generateQuiz(@RequestBody AiRequest req) {
        try {
            JsonNode quiz = aiService.generateQuiz(req.getTopic(), req.getNumQuestions(), req.getDifficulty(), req.getQuizType());
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Flashcards ──────────────────────────────────────────────────────────

    @PostMapping("/flashcards/generate")
    public ResponseEntity<?> generateFlashcards(@RequestBody AiRequest req) {
        try {
            return ResponseEntity.ok(aiService.generateFlashcards(req.getTopic(), req.getNumFlashcards()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Study Material ───────────────────────────────────────────────────────

    @PostMapping("/study-material/generate")
    public ResponseEntity<?> generateStudyMaterial(@RequestBody AiRequest req) {
        try {
            return ResponseEntity.ok(aiService.generateStudyMaterial(req.getTopic(), req.getGradeLevel(), req.getDifficulty()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Schedule ─────────────────────────────────────────────────────────────

    @PostMapping("/schedule/generate")
    public ResponseEntity<?> generateSchedule(@RequestBody AiRequest req) {
        try {
            // In production, fetch these from database
            String classesJson = "[]";
            String teachersJson = "[]";
            String subjectsJson = "[]";
            String rulesText = req.getRules() == null ? "" : req.getRules().stream()
                .map(r -> "- Subject " + r.getSubjectId() + ": " + r.getLecturesPerWeek() + " lectures/week")
                .collect(Collectors.joining("\n"));
            return ResponseEntity.ok(aiService.generateSchedule(classesJson, teachersJson, subjectsJson, rulesText));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Lead Analytics ───────────────────────────────────────────────────────

    @GetMapping("/leads/summary")
    public ResponseEntity<?> getLeadSummary(@RequestParam String instituteId) {
        try {
            List<Lead> leads = leadRepository.findByInstituteIdOrderByAddedDateDesc(UUID.fromString(instituteId));
            if (leads.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "No leads found"));

            String leadsData = leads.stream()
                .map(l -> "Status:" + l.getStatus() + ",Source:" + l.getSource() + ",Date:" + l.getAddedDate())
                .collect(Collectors.joining("; "));

            return ResponseEntity.ok(aiService.generateLeadSummary(leadsData, leads.size()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Lead Email ───────────────────────────────────────────────────────────

    @PostMapping("/leads/email")
    public ResponseEntity<?> generateLeadEmail(@RequestBody AiRequest req) {
        try {
            Lead lead = leadRepository.findById(UUID.fromString(req.getLeadId()))
                .orElseThrow(() -> new RuntimeException("Lead not found"));
            return ResponseEntity.ok(aiService.generateEmailForLead(lead.getName(), lead.getStatus(), req.getPurpose()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Lead Form Script ────────────────────────────────────────────────────

    @PostMapping("/leads/form-script")
    public ResponseEntity<?> generateLeadFormScript(@RequestBody AiRequest req) {
        try {
            return ResponseEntity.ok(aiService.generateLeadFormScript(req.getFields()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Game Levels ──────────────────────────────────────────────────────────

    @PostMapping("/game/generate")
    public ResponseEntity<?> generateGame(@RequestBody AiRequest req) {
        try {
            return ResponseEntity.ok(aiService.generateGameLevels(req.getTopic(), req.getNumLevels(), req.getQuestionsPerLevel()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Quote & Insight ─────────────────────────────────────────────────────

    @GetMapping("/quote")
    public ResponseEntity<?> getQuote() {
        return ResponseEntity.ok(Map.of("quote", aiService.generateQuote()));
    }

    @PostMapping("/insight")
    public ResponseEntity<?> getInsight(@RequestBody AiRequest req) {
        return ResponseEntity.ok(Map.of("insight", aiService.generatePersonalizedInsight(req.getRole())));
    }

    // ─── AI Help Chatbot (SSE) ────────────────────────────────────────────────

    @PostMapping(value = "/help/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamHelp(@RequestBody AiRequest req) {
        String context = "EduVeda is an all-in-one educational administration platform with roles: Product Owner, Branch Admin, Class Admin, Teacher, Student, Parent. Features include LMS, Fee Management, Lead CRM, Attendance, Scheduler, Gamification, Digital Marketing, and AI-powered tools.";
        return aiService.streamHelpResponse(req.getQuery(), req.getRole(), context)
            .map(chunk -> "data: " + chunk + "\n\n")
            .concatWith(Flux.just("data: [DONE]\n\n"));
    }

    // ─── AI Tutor "Veda" (SSE) ────────────────────────────────────────────────

    @PostMapping(value = "/tutor/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamTutor(@RequestBody AiRequest req) {
        return aiService.streamTutorResponse(req.getQuery(), req.getSubject())
            .map(chunk -> "data: " + chunk + "\n\n")
            .concatWith(Flux.just("data: [DONE]\n\n"));
    }

    // ─── Note Tools ───────────────────────────────────────────────────────────

    @PostMapping("/notes/summarize")
    public ResponseEntity<?> summarizeNote(@RequestBody AiRequest req) {
        return ResponseEntity.ok(Map.of("summary", aiService.summarizeNote(req.getNoteContent())));
    }

    @PostMapping("/notes/questions")
    public ResponseEntity<?> generateQuestions(@RequestBody AiRequest req) {
        return ResponseEntity.ok(Map.of("questions", aiService.generateQuestionsFromNote(req.getNoteContent())));
    }

    @PostMapping("/explain")
    public ResponseEntity<?> explainText(@RequestBody AiRequest req) {
        return ResponseEntity.ok(Map.of("explanation", aiService.explainText(req.getText())));
    }
}
