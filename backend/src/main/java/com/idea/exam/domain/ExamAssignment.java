package com.idea.exam.domain;

import com.idea.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Links an exam to a student it is directed to. References both by id. */
@Entity
@Table(name = "exam_assignments")
@Getter
@Setter
@NoArgsConstructor
public class ExamAssignment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id", nullable = false, updatable = false)
    private UUID assignmentId;

    @Column(name = "exam_id", nullable = false)
    private UUID examId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    public ExamAssignment(UUID examId, UUID studentId) {
        this.examId = examId;
        this.studentId = studentId;
    }
}
