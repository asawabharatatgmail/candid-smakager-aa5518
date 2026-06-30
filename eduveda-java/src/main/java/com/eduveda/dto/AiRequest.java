package com.eduveda.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiRequest {
    // Quiz
    private String topic;
    private int numQuestions = 10;
    private String difficulty = "Medium";
    private String quizType = "Multiple Choice";

    // Flashcards
    private int numFlashcards = 10;

    // Study Material
    private String gradeLevel = "High School";

    // Game
    private int numLevels = 3;
    private int questionsPerLevel = 5;

    // Schedule
    private String instituteId;
    private List<ScheduleRule> rules;

    // Lead Email
    private String leadId;
    private String purpose;

    // Lead Form
    private List<String> fields;

    // Chat / Tutor
    private String query;
    private String role;
    private String subject;

    // Note tools
    private String noteContent;

    // Explain
    private String text;

    @Data
    public static class ScheduleRule {
        private String subjectId;
        private int lecturesPerWeek;
    }
}
