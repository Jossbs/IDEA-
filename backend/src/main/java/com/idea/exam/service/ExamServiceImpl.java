package com.idea.exam.service;

import com.idea.exam.domain.Exam;
import com.idea.exam.domain.Question;
import com.idea.exam.domain.QuestionOption;
import com.idea.exam.domain.Subject;
import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.ExamDetailResponse;
import com.idea.exam.dto.ExamSummaryResponse;
import com.idea.exam.dto.GradingExam;
import com.idea.exam.dto.GradingQuestion;
import com.idea.exam.dto.StudentExamResponse;
import com.idea.exam.dto.StudentOptionResponse;
import com.idea.exam.dto.StudentQuestionResponse;
import com.idea.exam.mapper.ExamMapper;
import com.idea.exam.repository.ExamRepository;
import com.idea.exam.repository.SubjectRepository;
import com.idea.shared.web.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;

    public ExamServiceImpl(ExamRepository examRepository, SubjectRepository subjectRepository) {
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
    }

    /**
     * One atomic unit of work: building the graph and a single {@code save}
     * cascades inserts to exam → questions → options, propagating each generated
     * UUID to the children's foreign keys. If anything fails, the whole
     * transaction rolls back.
     */
    @Override
    @Transactional
    public UUID createExam(CreateExamRequest request, UUID teacherId) {
        Exam exam = ExamMapper.toEntity(request, teacherId);
        return examRepository.save(exam).getExamId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamSummaryResponse> listExams(UUID teacherId) {
        return examRepository.findSummariesByTeacher(teacherId);
    }

    @Override
    @Transactional(readOnly = true)
    public ExamDetailResponse getExam(UUID examId, UUID teacherId) {
        Exam exam = examRepository.findWithQuestionsByExamId(examId)
                .filter(Exam::isActiveRecord)
                .filter(e -> teacherId.equals(e.getTeacherId()))
                .orElseThrow(() -> notFound(examId));
        Subject subject = subjectRepository.findById(exam.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró la materia del examen " + examId + "."));
        return ExamMapper.toDetailResponse(exam, subject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamSummaryResponse> listPublishedExams() {
        return examRepository.findPublishedSummaries();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentExamResponse getExamForStudent(UUID examId) {
        Exam exam = examRepository.findWithQuestionsByExamId(examId)
                .filter(Exam::isActiveRecord)
                .filter(Exam::isPublished)
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

        return new StudentExamResponse(exam.getExamId(), exam.getTitle(), null, questions);
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
                exam.getTeacherId(), exam.isPublished(), maxScore, questions);
    }

    private static GradingQuestion toGradingQuestion(Question q) {
        var correctIds = q.getOptions().stream()
                .filter(QuestionOption::isCorrect)
                .map(QuestionOption::getOptionId)
                .collect(Collectors.toSet());
        return new GradingQuestion(q.getQuestionId(), q.getQuestionType(), q.getPoints(), correctIds);
    }

    private static ResourceNotFoundException notFound(UUID examId) {
        return new ResourceNotFoundException("No se encontró el examen con identificador " + examId + ".");
    }
}
