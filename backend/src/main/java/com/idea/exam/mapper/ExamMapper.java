package com.idea.exam.mapper;

import com.idea.exam.domain.Exam;
import com.idea.exam.domain.Question;
import com.idea.exam.domain.QuestionOption;
import com.idea.exam.domain.Subject;
import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.CreateOptionRequest;
import com.idea.exam.dto.CreateQuestionRequest;
import com.idea.exam.dto.ExamDetailResponse;
import com.idea.exam.dto.OptionResponse;
import com.idea.exam.dto.QuestionResponse;
import java.util.List;
import java.util.UUID;

/**
 * Builds the {@link Exam} object graph from the create request. The bidirectional
 * {@code addQuestion}/{@code addOption} links ensure the generated parent UUIDs
 * populate each child's foreign key on the cascaded insert.
 */
public final class ExamMapper {

    private ExamMapper() {
    }

    public static Exam toEntity(CreateExamRequest request, UUID teacherId) {
        Exam exam = new Exam();
        exam.setTeacherId(teacherId);
        applyContent(exam, request);
        return exam;
    }

    /**
     * Overwrites an existing exam's config and replaces its question graph from
     * the request. orphanRemoval deletes the old questions/options; safe only
     * when the exam has no submissions (the service guards that).
     */
    public static void applyUpdate(Exam exam, CreateExamRequest request) {
        exam.getQuestions().clear();
        applyContent(exam, request);
    }

    private static void applyContent(Exam exam, CreateExamRequest request) {
        exam.setSubjectId(request.subjectId());
        exam.setTitle(request.title().trim());
        exam.setDescription(
                request.description() == null || request.description().isBlank()
                        ? null
                        : request.description().trim());
        exam.setPublished(request.published());

        for (CreateQuestionRequest q : request.questions()) {
            exam.addQuestion(toQuestion(q));
        }
    }

    private static Question toQuestion(CreateQuestionRequest request) {
        Question question = new Question();
        question.setQuestionText(request.questionText().trim());
        question.setQuestionType(request.questionType());
        question.setDifficultyLevel(request.difficultyLevel());
        question.setPoints(request.points());
        question.setSortOrder(request.sortOrder());

        for (CreateOptionRequest o : request.options()) {
            question.addOption(toOption(o));
        }
        return question;
    }

    private static QuestionOption toOption(CreateOptionRequest request) {
        QuestionOption option = new QuestionOption();
        option.setOptionText(request.optionText().trim());
        option.setCorrect(request.correct());
        return option;
    }

    /**
     * Full teacher-facing read model. The subject is passed in (resolved by id)
     * since the exam references it by identifier, not as a JPA relationship.
     */
    public static ExamDetailResponse toDetailResponse(
            Exam exam, Subject subject, List<UUID> assignedStudentIds) {
        List<QuestionResponse> questions = exam.getQuestions().stream()
                .map(ExamMapper::toQuestionResponse)
                .toList();
        return new ExamDetailResponse(
                exam.getExamId(),
                exam.getTitle(),
                exam.getDescription(),
                subject.getSubjectIdentifier(),
                subject.getSubjectName(),
                subject.getAcademicLevel(),
                exam.isPublished(),
                assignedStudentIds,
                questions);
    }

    private static QuestionResponse toQuestionResponse(Question question) {
        List<OptionResponse> options = question.getOptions().stream()
                .map(o -> new OptionResponse(o.getOptionId(), o.getOptionText(), o.isCorrect()))
                .toList();
        return new QuestionResponse(
                question.getQuestionId(),
                question.getQuestionText(),
                question.getQuestionType(),
                question.getDifficultyLevel(),
                question.getPoints(),
                question.getSortOrder(),
                options);
    }
}
