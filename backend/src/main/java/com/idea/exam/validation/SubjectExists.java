package com.idea.exam.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;

/**
 * Validates that a UUID references an existing subject — the Spring equivalent
 * of Laravel's {@code exists:subjects,subject_identifier}. Reports a 400 through
 * the global validation handler, alongside the other field errors.
 */
@Documented
@Constraint(validatedBy = SubjectExistsValidator.class)
@Target({FIELD, PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface SubjectExists {
    String message() default "La materia indicada no existe.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
