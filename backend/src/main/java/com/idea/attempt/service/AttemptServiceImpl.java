package com.idea.attempt.service;

import com.idea.attempt.domain.AttemptAnswer;
import com.idea.attempt.domain.AttemptStatus;
import com.idea.attempt.domain.ExamAttempt;
import com.idea.attempt.dto.AttemptResultResponse;
import com.idea.attempt.dto.ExamResultsResponse;
import com.idea.attempt.dto.ResultEntry;
import com.idea.attempt.dto.StudentExamCard;
import com.idea.attempt.dto.SubmitAttemptRequest;
import com.idea.attempt.repository.AttemptRepository;
import com.idea.exam.dto.GradingExam;
import com.idea.exam.dto.GradingQuestion;
import com.idea.exam.service.ExamService;
import com.idea.shared.web.exception.DuplicateResourceException;
import com.idea.shared.web.exception.ResourceNotFoundException;
import java.time.LocalDateTime;
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
        Set<UUID> taken = new HashSet<>(attemptRepository.findExamIdsByStudent(studentId));
        return examService.listAssignedPublishedExams(studentId).stream()
                .map(e -> new StudentExamCard(
                        e.examId(), e.title(), e.subjectName(), e.academicLevel(),
                        e.questionCount(), taken.contains(e.examId())))
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
                            r.studentName(), r.submittedAt(), r.autoScore() + manual, r.status(), pending);
                })
                .toList();
        return new ExamResultsResponse(
                exam.examId(), exam.title(), exam.subjectName(),
                exam.maxScore(), passingScore, results);
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
