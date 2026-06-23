package com.idea.exam.domain;

import com.idea.shared.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * An exam authored by a teacher. References a {@code subject} and owns an
 * ordered list of {@link Question}s (cascaded on persist/remove).
 */
@Entity
@Table(name = "exams")
@Getter
@Setter
@NoArgsConstructor
public class Exam extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "exam_id", nullable = false, updatable = false)
    private UUID examId;

    /** FK to {@code subjects.subject_identifier}; modules reference by id, not entity. */
    @Column(name = "subject_id", nullable = false)
    private UUID subjectId;

    /** FK to {@code users.user_id} — the teacher who authored this exam. */
    @Column(name = "teacher_id")
    private UUID teacherId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "is_published", nullable = false)
    private boolean published;

    /** Declared total the exam is worth; equals the sum of its question points. */
    @Column(name = "total_points", nullable = false)
    private int totalPoints;

    /** Minimum score to accredit the exam (the "promedio"/nota de acreditación). */
    @Column(name = "passing_score", nullable = false)
    private int passingScore;

    /** Optional delivery deadline shown to students; null means no due date. */
    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<Question> questions = new ArrayList<>();

    /** Links both sides of the relationship so the FK is set on cascade insert. */
    public void addQuestion(Question question) {
        question.setExam(this);
        this.questions.add(question);
    }
}
