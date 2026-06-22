package com.idea.exam.repository;

import com.idea.exam.domain.Exam;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** Persistence access for {@link Exam}. Questions/options cascade through it. */
public interface ExamRepository extends JpaRepository<Exam, UUID> {
}
