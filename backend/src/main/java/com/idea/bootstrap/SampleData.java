package com.idea.bootstrap;

import com.idea.auth.domain.Role;
import com.idea.auth.dto.RegisterRequest;
import com.idea.exam.domain.AcademicLevel;
import com.idea.exam.domain.DifficultyLevel;
import com.idea.exam.domain.QuestionType;
import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.CreateOptionRequest;
import com.idea.exam.dto.CreateQuestionRequest;
import com.idea.exam.dto.SubjectRequest;
import java.util.List;
import java.util.UUID;

/**
 * Factories for demo data. Each method builds a valid request DTO so the seeder
 * can create entities through the same public services real users go through —
 * keeping seeded data consistent with production validation rules.
 */
final class SampleData {

    /** Shared demo passwords (>= 8 chars, as the register contract requires). */
    static final String TEACHER_PASSWORD = "Profesor123";
    static final String STUDENT_PASSWORD = "Alumno123";

    private SampleData() {
    }

    static RegisterRequest teacher(String email, String fullName) {
        return new RegisterRequest(email, TEACHER_PASSWORD, fullName, Role.TEACHER);
    }

    static RegisterRequest student(String email, String fullName) {
        return new RegisterRequest(email, STUDENT_PASSWORD, fullName, Role.STUDENT);
    }

    static SubjectRequest subject(String name, AcademicLevel level) {
        return new SubjectRequest(name, level);
    }

    static CreateOptionRequest option(String text, boolean correct) {
        return new CreateOptionRequest(text, correct);
    }

    static CreateQuestionRequest single(
            int order, String text, DifficultyLevel difficulty, int points, CreateOptionRequest... options) {
        return new CreateQuestionRequest(
                text, QuestionType.SINGLE_CHOICE, difficulty, points, order, List.of(options));
    }

    static CreateQuestionRequest multiple(
            int order, String text, DifficultyLevel difficulty, int points, CreateOptionRequest... options) {
        return new CreateQuestionRequest(
                text, QuestionType.MULTIPLE_CHOICE, difficulty, points, order, List.of(options));
    }

    static CreateQuestionRequest trueFalse(
            int order, String text, boolean answerIsTrue, DifficultyLevel difficulty, int points) {
        return new CreateQuestionRequest(
                text, QuestionType.TRUE_FALSE, difficulty, points, order,
                List.of(option("Verdadero", answerIsTrue), option("Falso", !answerIsTrue)));
    }

    static CreateQuestionRequest shortText(int order, String text, DifficultyLevel difficulty, int points) {
        return new CreateQuestionRequest(
                text, QuestionType.SHORT_TEXT, difficulty, points, order, List.of());
    }

    static CreateExamRequest exam(
            String title,
            UUID subjectId,
            String description,
            boolean published,
            List<UUID> studentIds,
            CreateQuestionRequest... questions) {
        return new CreateExamRequest(
                title, subjectId, description, published, List.of(questions), studentIds);
    }
}
