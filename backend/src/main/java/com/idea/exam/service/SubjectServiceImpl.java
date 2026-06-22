package com.idea.exam.service;

import com.idea.exam.domain.Subject;
import com.idea.exam.dto.SubjectRequest;
import com.idea.exam.dto.SubjectResponse;
import com.idea.exam.mapper.SubjectMapper;
import com.idea.exam.repository.SubjectRepository;
import com.idea.shared.web.exception.DuplicateResourceException;
import com.idea.shared.web.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectServiceImpl(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponse> findAll(boolean includeInactive) {
        List<Subject> subjects = includeInactive
                ? subjectRepository.findAllByOrderBySubjectNameAsc()
                : subjectRepository.findAllByActiveRecordTrueOrderBySubjectNameAsc();
        return subjects.stream().map(SubjectMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectResponse findById(UUID subjectIdentifier) {
        return SubjectMapper.toResponse(getOrThrow(subjectIdentifier));
    }

    @Override
    public SubjectResponse create(SubjectRequest request) {
        String name = request.subjectName().trim();
        if (subjectRepository.existsBySubjectNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Ya existe una materia con el nombre \"" + name + "\".");
        }
        // saveAndFlush so the DB-generated audit timestamps are populated in the response.
        Subject saved = subjectRepository.saveAndFlush(SubjectMapper.toEntity(request));
        return SubjectMapper.toResponse(saved);
    }

    @Override
    public SubjectResponse update(UUID subjectIdentifier, SubjectRequest request) {
        Subject subject = getOrThrow(subjectIdentifier);
        String name = request.subjectName().trim();
        if (subjectRepository.existsBySubjectNameIgnoreCaseAndSubjectIdentifierNot(name, subjectIdentifier)) {
            throw new DuplicateResourceException("Ya existe otra materia con el nombre \"" + name + "\".");
        }
        SubjectMapper.applyRequest(subject, request);
        // Flush so the refreshed update_timestamp is reflected in the response.
        return SubjectMapper.toResponse(subjectRepository.saveAndFlush(subject));
    }

    @Override
    public SubjectResponse setActive(UUID subjectIdentifier, boolean active) {
        Subject subject = getOrThrow(subjectIdentifier);
        subject.setActiveRecord(active);
        return SubjectMapper.toResponse(subjectRepository.saveAndFlush(subject));
    }

    private Subject getOrThrow(UUID subjectIdentifier) {
        return subjectRepository.findById(subjectIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró la materia con identificador " + subjectIdentifier + "."));
    }
}
