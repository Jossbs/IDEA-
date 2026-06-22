package com.idea.exam.service;

import com.idea.exam.domain.Exam;
import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.mapper.ExamMapper;
import com.idea.exam.repository.ExamRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;

    public ExamServiceImpl(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    /**
     * One atomic unit of work: building the graph and a single {@code save}
     * cascades inserts to exam → questions → options, propagating each generated
     * UUID to the children's foreign keys. If anything fails, the whole
     * transaction rolls back.
     */
    @Override
    @Transactional
    public UUID createExam(CreateExamRequest request) {
        Exam exam = ExamMapper.toEntity(request);
        return examRepository.save(exam).getExamId();
    }
}
