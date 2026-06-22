package com.idea.attempt.domain;

import com.idea.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One recorded answer within an attempt. For choice/true-false questions there
 * is one row per selected option ({@code selectedOptionId}); for short-text a
 * single row with {@code answerText}. Unanswered questions have no row.
 */
@Entity
@Table(name = "attempt_answers")
@Getter
@Setter
@NoArgsConstructor
public class AttemptAnswer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "answer_id", nullable = false, updatable = false)
    private UUID answerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "selected_option_id")
    private UUID selectedOptionId;

    @Column(name = "answer_text", columnDefinition = "text")
    private String answerText;
}
