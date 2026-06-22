package com.idea.exam.domain;

import com.idea.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Academic subject an exam can belong to (e.g. "Mathematics").
 *
 * <p>The first concrete entity of the system; future {@code exams.subject_id}
 * will reference {@link #subjectIdentifier}.</p>
 */
@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
public class Subject extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "subject_identifier", nullable = false, updatable = false)
    private UUID subjectIdentifier;

    @Column(name = "subject_name", nullable = false, length = 100, unique = true)
    private String subjectName;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_level", nullable = false, length = 50)
    private AcademicLevel academicLevel;
}
