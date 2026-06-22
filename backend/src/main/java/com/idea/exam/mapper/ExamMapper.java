package com.idea.exam.mapper;

import com.idea.exam.domain.Exam;
import com.idea.exam.domain.Question;
import com.idea.exam.domain.QuestionOption;
import com.idea.exam.dto.CreateExamRequest;
import com.idea.exam.dto.CreateOptionRequest;
import com.idea.exam.dto.CreateQuestionRequest;

/**
 * Builds the {@link Exam} object graph from the create request. The bidirectional
 * {@code addQuestion}/{@code addOption} links ensure the generated parent UUIDs
 * populate each child's foreign key on the cascaded insert.
 */
public final class ExamMapper {

    private ExamMapper() {
    }

    public static Exam toEntity(CreateExamRequest request) {
        Exam exam = new Exam();
        exam.setSubjectId(request.subjectId());
        exam.setTitle(request.title().trim());
        exam.setDescription(
                request.description() == null || request.description().isBlank()
                        ? null
                        : request.description().trim());
        exam.setPublished(request.published());

        for (CreateQuestionRequest q : request.questions()) {
            exam.addQuestion(toQuestion(q));
        }
        return exam;
    }

    private static Question toQuestion(CreateQuestionRequest request) {
        Question question = new Question();
        question.setQuestionText(request.questionText().trim());
        question.setQuestionType(request.questionType());
        question.setDifficultyLevel(request.difficultyLevel());
        question.setPoints(request.points());
        question.setSortOrder(request.sortOrder());

        for (CreateOptionRequest o : request.options()) {
            question.addOption(toOption(o));
        }
        return question;
    }

    private static QuestionOption toOption(CreateOptionRequest request) {
        QuestionOption option = new QuestionOption();
        option.setOptionText(request.optionText().trim());
        option.setCorrect(request.correct());
        return option;
    }
}
