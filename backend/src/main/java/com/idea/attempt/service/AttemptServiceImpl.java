package com.idea.attempt.service;

import com.idea.attempt.domain.AttemptAnswer;
import com.idea.attempt.domain.AttemptStatus;
import com.idea.attempt.domain.ExamAttempt;
import com.idea.attempt.dto.AttemptResultResponse;
import com.idea.attempt.dto.AttemptReviewResponse;
import com.idea.attempt.dto.ExamResultsResponse;
import com.idea.attempt.dto.QuestionGrade;
import com.idea.attempt.dto.ResultEntry;
import com.idea.attempt.dto.ReviewItem;
import com.idea.attempt.dto.ReviewRequest;
import com.idea.attempt.dto.StudentAnswerOption;
import com.idea.attempt.dto.StudentAnswerReview;
import com.idea.attempt.dto.StudentAttemptReview;
import com.idea.attempt.dto.StudentExamCard;
import com.idea.attempt.dto.SubmitAttemptRequest;
import com.idea.attempt.repository.AttemptRepository;
import com.idea.exam.domain.QuestionType;
import com.idea.exam.dto.GradingExam;
import com.idea.exam.dto.GradingQuestion;
import com.idea.exam.service.ExamService;
import com.idea.shared.web.exception.DuplicateResourceException;
import com.idea.shared.web.exception.ResourceNotFoundException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttemptServiceImpl implements AttemptService {

    private final AttemptRepository attemptRepository;
    private final ExamService examService;

    public AttemptServiceImpl(AttemptRepository attemptRepository, ExamService examService) {
        this.attemptRepository = attemptRepository;
        this.examService = examService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentExamCard> listAvailableForStudent(UUID studentId) {
        Map<UUID, ExamAttempt> attempts =
                attemptRepository.findByStudentIdAndActiveRecordTrue(studentId).stream()
                        .collect(Collectors.toMap(ExamAttempt::getExamId, a -> a, (a, b) -> a));
        return examService.listAssignedPublishedExams(studentId).stream()
                .map(e -> {
                    ExamAttempt a = attempts.get(e.examId());
                    if (a == null) {
                        return new StudentExamCard(
                                e.examId(), e.title(), e.subjectName(), e.academicLevel(),
                                e.questionCount(), false, null, null, null);
                    }
                    return new StudentExamCard(
                            e.examId(), e.title(), e.subjectName(), e.academicLevel(),
                            e.questionCount(), true, a.getStatus(), totalScore(a), a.getMaxScore());
                })
                .toList();
    }

    @Override
    @Transactional
    public AttemptResultResponse submit(UUID examId, UUID studentId, SubmitAttemptRequest request) {
        GradingExam exam = examService.getGradingExam(examId);
        if (!exam.published()) {
            throw new ResourceNotFoundException("El examen no está disponible.");
        }
        if (attemptRepository.existsByExamIdAndStudentIdAndActiveRecordTrue(examId, studentId)) {
            throw new DuplicateResourceException("Ya presentaste este examen.");
        }

        Map<UUID, AnswerInput> byQuestion = index(request);

        ExamAttempt attempt = new ExamAttempt();
        attempt.setExamId(examId);
        attempt.setStudentId(studentId);
        attempt.setMaxScore(exam.maxScore());
        attempt.setSubmittedAt(LocalDateTime.now());

        int autoScore = 0;
        boolean needsReview = false;

        for (GradingQuestion question : exam.questions()) {
            AnswerInput input = byQuestion.get(question.questionId());
            if (!question.isAutoGradable()) {
                needsReview = true;
                String text = input == null ? null : input.text();
                if (text != null && !text.isBlank()) {
                    attempt.addAnswer(textAnswer(question.questionId(), text.trim()));
                }
                continue;
            }
            Set<UUID> selected = input == null ? Set.of() : input.optionIds();
            for (UUID optionId : selected) {
                attempt.addAnswer(optionAnswer(question.questionId(), optionId));
            }
            // All-or-nothing: the selected set must match the correct set exactly.
            if (!selected.isEmpty() && selected.equals(question.correctOptionIds())) {
                autoScore += question.points();
            }
        }

        attempt.setAutoScore(autoScore);
        attempt.setStatus(needsReview ? AttemptStatus.PENDING_REVIEW : AttemptStatus.GRADED);
        ExamAttempt saved = attemptRepository.save(attempt);

        return new AttemptResultResponse(
                saved.getAttemptId(), saved.getStatus(), autoScore, exam.maxScore());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentAttemptReview getMyResult(UUID examId, UUID studentId) {
        ExamAttempt attempt = attemptRepository
                .findByExamIdAndStudentIdAndActiveRecordTrue(examId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Aún no has presentado este examen."));
        GradingExam exam = examService.getGradingExam(examId);

        Map<UUID, Set<UUID>> selectedByQuestion = new HashMap<>();
        Map<UUID, String> textByQuestion = new HashMap<>();
        for (AttemptAnswer ans : attempt.getAnswers()) {
            if (ans.getSelectedOptionId() != null) {
                selectedByQuestion
                        .computeIfAbsent(ans.getQuestionId(), k -> new HashSet<>())
                        .add(ans.getSelectedOptionId());
            }
            if (ans.getAnswerText() != null) {
                textByQuestion.put(ans.getQuestionId(), ans.getAnswerText());
            }
        }

        List<StudentAnswerReview> questions = exam.questions().stream()
                .map(q -> toAnswerReview(
                        q,
                        selectedByQuestion.getOrDefault(q.questionId(), Set.of()),
                        textByQuestion.get(q.questionId())))
                .toList();

        return new StudentAttemptReview(
                exam.examId(), exam.title(), attempt.getStatus(),
                totalScore(attempt), exam.maxScore(), questions);
    }

    /** Maps one graded question to the student's correction view. */
    private static StudentAnswerReview toAnswerReview(
            GradingQuestion question, Set<UUID> selected, String text) {
        if (!question.isAutoGradable()) {
            return new StudentAnswerReview(
                    question.questionId(), question.questionText(), question.questionType(),
                    question.points(), null, false, false, text == null ? "" : text, List.of());
        }
        List<StudentAnswerOption> options = question.options().stream()
                .map(o -> new StudentAnswerOption(
                        o.optionId(), o.optionText(), o.correct(), selected.contains(o.optionId())))
                .toList();
        boolean correct = !selected.isEmpty() && selected.equals(question.correctOptionIds());
        return new StudentAnswerReview(
                question.questionId(), question.questionText(), question.questionType(),
                question.points(), correct ? question.points() : 0, correct, true, null, options);
    }

    /** Auto score plus manual score (0 until reviewed). */
    private static int totalScore(ExamAttempt attempt) {
        return attempt.getAutoScore()
                + (attempt.getManualScore() == null ? 0 : attempt.getManualScore());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResultsResponse getResults(UUID examId, UUID teacherId) {
        GradingExam exam = examService.getGradingExam(examId);
        if (!teacherId.equals(exam.teacherId())) {
            throw new ResourceNotFoundException(
                    "No se encontró el examen con identificador " + examId + ".");
        }
        int passingScore = (int) Math.ceil(exam.maxScore() * 0.6);
        List<ResultEntry> results = attemptRepository.findResultRows(examId).stream()
                .map(r -> {
                    int manual = r.manualScore() == null ? 0 : r.manualScore();
                    boolean pending = r.status() == AttemptStatus.PENDING_REVIEW;
                    return new ResultEntry(
                            r.attemptId(), r.studentName(), r.submittedAt(),
                            r.autoScore() + manual, r.status(), pending);
                })
                .toList();
        return new ExamResultsResponse(
                exam.examId(), exam.title(), exam.subjectName(),
                exam.maxScore(), passingScore, results);
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptReviewResponse getReview(UUID examId, UUID attemptId, UUID teacherId) {
        GradingExam exam = ownedExam(examId, teacherId);
        ExamAttempt attempt = attemptRepository.findWithAnswersByAttemptId(attemptId)
                .filter(a -> examId.equals(a.getExamId()))
                .orElseThrow(() -> attemptNotFound(attemptId));

        String studentName = attemptRepository.findStudentName(attemptId).orElse("Alumno");
        Map<UUID, String> textByQuestion = attempt.getAnswers().stream()
                .filter(a -> a.getAnswerText() != null)
                .collect(Collectors.toMap(
                        AttemptAnswer::getQuestionId, AttemptAnswer::getAnswerText, (a, b) -> a));

        List<ReviewItem> items = exam.questions().stream()
                .filter(q -> q.questionType() == QuestionType.SHORT_TEXT)
                .map(q -> new ReviewItem(
                        q.questionId(), q.questionText(), q.points(),
                        textByQuestion.getOrDefault(q.questionId(), "")))
                .toList();

        return new AttemptReviewResponse(
                attempt.getAttemptId(), studentName, attempt.getAutoScore(),
                exam.maxScore(), attempt.getStatus(), items);
    }

    @Override
    @Transactional
    public void review(UUID examId, UUID attemptId, UUID teacherId, ReviewRequest request) {
        GradingExam exam = ownedExam(examId, teacherId);
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .filter(a -> examId.equals(a.getExamId()))
                .orElseThrow(() -> attemptNotFound(attemptId));

        Map<UUID, Integer> maxByQuestion = exam.questions().stream()
                .filter(q -> q.questionType() == QuestionType.SHORT_TEXT)
                .collect(Collectors.toMap(GradingQuestion::questionId, GradingQuestion::points));

        int manualScore = 0;
        for (QuestionGrade grade : request.grades()) {
            Integer max = maxByQuestion.get(grade.questionId());
            if (max == null) {
                throw new IllegalArgumentException(
                        "La pregunta no es de respuesta abierta o no pertenece al examen.");
            }
            if (grade.points() > max) {
                throw new IllegalArgumentException(
                        "Los puntos (" + grade.points() + ") exceden el máximo de la pregunta (" + max + ").");
            }
            manualScore += grade.points();
        }

        attempt.setManualScore(manualScore);
        attempt.setStatus(AttemptStatus.GRADED);
        attemptRepository.save(attempt);
    }

    @Override
    @Transactional
    public void resetAttempt(UUID examId, UUID attemptId, UUID teacherId) {
        ownedExam(examId, teacherId); // authorize
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .filter(a -> examId.equals(a.getExamId()))
                .orElseThrow(() -> attemptNotFound(attemptId));
        // Soft-delete frees the unique active attempt so the student can retry.
        attempt.setActiveRecord(false);
        attemptRepository.save(attempt);
    }

    /** Loads the exam's grading model and verifies it belongs to the teacher. */
    private GradingExam ownedExam(UUID examId, UUID teacherId) {
        GradingExam exam = examService.getGradingExam(examId);
        if (!teacherId.equals(exam.teacherId())) {
            throw new ResourceNotFoundException(
                    "No se encontró el examen con identificador " + examId + ".");
        }
        return exam;
    }

    private static ResourceNotFoundException attemptNotFound(UUID attemptId) {
        return new ResourceNotFoundException("No se encontró el intento " + attemptId + ".");
    }

    private static Map<UUID, AnswerInput> index(SubmitAttemptRequest request) {
        if (request.answers() == null) {
            return Map.of();
        }
        return request.answers().stream().collect(Collectors.toMap(
                a -> a.questionId(),
                a -> new AnswerInput(
                        a.selectedOptionIds() == null
                                ? Set.of()
                                : new LinkedHashSet<>(a.selectedOptionIds()),
                        a.answerText()),
                (first, second) -> second)); // last answer for a question wins
    }

    private static AttemptAnswer optionAnswer(UUID questionId, UUID optionId) {
        AttemptAnswer answer = new AttemptAnswer();
        answer.setQuestionId(questionId);
        answer.setSelectedOptionId(optionId);
        return answer;
    }

    private static AttemptAnswer textAnswer(UUID questionId, String text) {
        AttemptAnswer answer = new AttemptAnswer();
        answer.setQuestionId(questionId);
        answer.setAnswerText(text);
        return answer;
    }

    /** Normalized view of one submitted answer. */
    private record AnswerInput(Set<UUID> optionIds, String text) {
    }
}
