package com.idea.exam.service;

import com.idea.exam.domain.Exam;
import com.idea.exam.domain.ExamAssignment;
import com.idea.exam.domain.Question;
import com.idea.exam.domain.Subject;
import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.ExamAverage;
import com.idea.exam.dto.ExamDetailResponse;
import com.idea.exam.dto.ExamSummaryResponse;
import com.idea.exam.dto.GradingExam;
import com.idea.exam.dto.GradingOption;
import com.idea.exam.dto.GradingQuestion;
import com.idea.exam.dto.StudentExamResponse;
import com.idea.exam.dto.StudentOptionResponse;
import com.idea.exam.dto.StudentQuestionResponse;
import com.idea.exam.mapper.ExamMapper;
import com.idea.exam.repository.AssignmentRepository;
import com.idea.exam.repository.ExamRepository;
import com.idea.exam.repository.SubjectRepository;
import com.idea.shared.web.exception.ConflictException;
import com.idea.shared.web.exception.ResourceNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final AssignmentRepository assignmentRepository;

    public ExamServiceImpl(
            ExamRepository examRepository,
            SubjectRepository subjectRepository,
            AssignmentRepository assignmentRepository) {
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
        this.assignmentRepository = assignmentRepository;
    }

    /**
     * One atomic unit of work: building the graph and a single {@code save}
     * cascades inserts to exam → questions → options, propagating each generated
     * UUID to the children's foreign keys. Student assignments (if any) are
     * persisted in the same transaction.
     */
    @Override
    @Transactional
    public UUID createExam(CreateExamRequest request, UUID teacherId) {
        validateScoring(request);
        Exam exam = ExamMapper.toEntity(request, teacherId);
        UUID examId = examRepository.save(exam).getExamId();
        replaceAssignments(examId, request.studentIds());
        return examId;
    }

    @Override
    @Transactional
    public void updateExam(UUID examId, UUID teacherId, CreateExamRequest request) {
        validateScoring(request);
        Exam exam = ownedExam(examId, teacherId);
        if (examRepository.countAttempts(examId) > 0) {
            throw new ConflictException(
                    "No se puede editar un examen que ya tiene entregas de alumnos.");
        }
        ExamMapper.applyUpdate(exam, request);
        examRepository.save(exam);
        replaceAssignments(examId, request.studentIds());
    }

    @Override
    @Transactional
    public UUID duplicateExam(UUID examId, UUID teacherId) {
        Exam source = ownedExam(examId, teacherId);
        Exam copy = ExamMapper.duplicate(source, teacherId, source.getTitle() + " (copia)");
        return examRepository.save(copy).getExamId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamSummaryResponse> listExams(UUID teacherId) {
        List<ExamSummaryResponse> summaries = examRepository.findSummariesByTeacher(teacherId);
        if (summaries.isEmpty()) {
            return summaries;
        }
        List<UUID> examIds = summaries.stream().map(ExamSummaryResponse::examId).toList();
        Map<UUID, Double> averages = averageScores(examIds);
        return summaries.stream()
                .map(s -> s.withAverage(averages.get(s.examId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<UUID, Double> averageScores(List<UUID> examIds) {
        if (examIds == null || examIds.isEmpty()) {
            return Map.of();
        }
        return examRepository.findAverageScores(examIds).stream()
                .filter(a -> a.averageScore() != null)
                .collect(Collectors.toMap(ExamAverage::examId, ExamAverage::averageScore));
    }

    @Override
    @Transactional(readOnly = true)
    public ExamDetailResponse getExam(UUID examId, UUID teacherId) {
        Exam exam = ownedExam(examId, teacherId);
        Subject subject = subjectRepository.findById(exam.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró la materia del examen " + examId + "."));
        List<UUID> assigned = assignmentRepository.findStudentIdsByExamId(examId);
        return ExamMapper.toDetailResponse(exam, subject, assigned);
    }

    @Override
    @Transactional
    public void assignStudents(UUID examId, UUID teacherId, List<UUID> studentIds) {
        ownedExam(examId, teacherId); // authorize
        replaceAssignments(examId, studentIds);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamSummaryResponse> listAssignedPublishedExams(UUID studentId) {
        return examRepository.findPublishedSummariesAssignedTo(studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentExamResponse getExamForStudent(UUID examId, UUID studentId) {
        Exam exam = examRepository.findWithQuestionsByExamId(examId)
                .filter(Exam::isActiveRecord)
                .filter(Exam::isPublished)
                .filter(e -> assignmentRepository.existsByExamIdAndStudentId(examId, studentId))
                .orElseThrow(() -> notFound(examId));

        List<StudentQuestionResponse> questions = exam.getQuestions().stream()
                .map(q -> new StudentQuestionResponse(
                        q.getQuestionId(),
                        q.getQuestionText(),
                        q.getQuestionType(),
                        q.getPoints(),
                        q.getOptions().stream()
                                .map(o -> new StudentOptionResponse(o.getOptionId(), o.getOptionText()))
                                .toList()))
                .toList();

        return new StudentExamResponse(
                exam.getExamId(), exam.getTitle(), null,
                exam.getTotalPoints(), exam.getPassingScore(), exam.getDueAt(), questions);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isAssignedTo(UUID examId, UUID studentId) {
        return assignmentRepository.existsByExamIdAndStudentId(examId, studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public GradingExam getGradingExam(UUID examId) {
        Exam exam = examRepository.findWithQuestionsByExamId(examId)
                .filter(Exam::isActiveRecord)
                .orElseThrow(() -> notFound(examId));
        Subject subject = subjectRepository.findById(exam.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró la materia del examen " + examId + "."));

        List<GradingQuestion> questions = exam.getQuestions().stream()
                .map(ExamServiceImpl::toGradingQuestion)
                .toList();
        int maxScore = questions.stream().mapToInt(GradingQuestion::points).sum();

        return new GradingExam(
                exam.getExamId(), exam.getTitle(), subject.getSubjectName(),
                exam.getTeacherId(), exam.isPublished(), maxScore,
                exam.getPassingScore(), questions);
    }

    /**
     * Cross-field rule (point 4): the teacher's declared {@code totalPoints} must
     * equal the sum of the question points, and the accreditation threshold can
     * never exceed the total. Bean validation already checked each field in
     * isolation; this guards how they fit together.
     */
    private static void validateScoring(CreateExamRequest request) {
        int distributed = request.questions().stream()
                .mapToInt(q -> q.points() == null ? 0 : q.points())
                .sum();
        if (distributed != request.totalPoints()) {
            throw new IllegalArgumentException(
                    "La suma de los puntos de las preguntas (" + distributed
                            + ") no coincide con el puntaje total del examen ("
                            + request.totalPoints() + ").");
        }
        if (request.passingScore() > request.totalPoints()) {
            throw new IllegalArgumentException(
                    "El puntaje de acreditación (" + request.passingScore()
                            + ") no puede ser mayor que el puntaje total ("
                            + request.totalPoints() + ").");
        }
    }

    /** Loads an active exam and verifies it belongs to the teacher. */
    private Exam ownedExam(UUID examId, UUID teacherId) {
        return examRepository.findWithQuestionsByExamId(examId)
                .filter(Exam::isActiveRecord)
                .filter(e -> teacherId.equals(e.getTeacherId()))
                .orElseThrow(() -> notFound(examId));
    }

    /** Replaces an exam's assignment set with the (de-duplicated) student ids. */
    private void replaceAssignments(UUID examId, List<UUID> studentIds) {
        assignmentRepository.deleteByExamId(examId);
        if (studentIds == null || studentIds.isEmpty()) {
            return;
        }
        List<ExamAssignment> assignments = studentIds.stream()
                .distinct()
                .map(studentId -> new ExamAssignment(examId, studentId))
                .toList();
        assignmentRepository.saveAll(assignments);
    }

    private static GradingQuestion toGradingQuestion(Question q) {
        List<GradingOption> options = q.getOptions().stream()
                .map(o -> new GradingOption(o.getOptionId(), o.getOptionText(), o.isCorrect()))
                .toList();
        return new GradingQuestion(
                q.getQuestionId(), q.getQuestionText(), q.getQuestionType(), q.getPoints(), options);
    }

    private static ResourceNotFoundException notFound(UUID examId) {
        return new ResourceNotFoundException("No se encontró el examen con identificador " + examId + ".");
    }
}
