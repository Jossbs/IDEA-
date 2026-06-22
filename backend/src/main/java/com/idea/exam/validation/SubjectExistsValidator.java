package com.idea.exam.validation;

import com.idea.exam.repository.SubjectRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.UUID;

/**
 * Backing validator for {@link SubjectExists}. A {@code null} id passes here so
 * the field's {@code @NotNull} owns the "required" message (single responsibility).
 */
public class SubjectExistsValidator implements ConstraintValidator<SubjectExists, UUID> {

    private final SubjectRepository subjectRepository;

    public SubjectExistsValidator(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Override
    public boolean isValid(UUID subjectId, ConstraintValidatorContext context) {
        return subjectId == null || subjectRepository.existsById(subjectId);
    }
}
