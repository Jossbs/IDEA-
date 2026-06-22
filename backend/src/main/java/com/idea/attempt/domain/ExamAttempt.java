package com.idea.attempt.domain;

import com.idea.shared.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A student's single submission for an exam. References the exam and student by
 * id (cross-module). Holds the auto-graded score now and an optional manual
 * score added later when a teacher reviews short-text answers.
 */
@Entity
@Table(name = "exam_attempts")
@Getter
@Setter
@NoArgsConstructor
public class ExamAttempt extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attempt_id", nullable = false, updatable = false)
    private UUID attemptId;

    @Column(name = "exam_id", nullable = false)
    private UUID examId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AttemptStatus status;

    /** Points from auto-graded (choice/true-false) questions. */
    @Column(name = "auto_score", nullable = false)
    private int autoScore;

    /** Points the teacher awarded for short-text answers; null until reviewed. */
    @Column(name = "manual_score")
    private Integer manualScore;

    /** Total points the exam is worth. */
    @Column(name = "max_score", nullable = false)
    private int maxScore;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttemptAnswer> answers = new ArrayList<>();

    public void addAnswer(AttemptAnswer answer) {
        answer.setAttempt(this);
        this.answers.add(answer);
    }
}
