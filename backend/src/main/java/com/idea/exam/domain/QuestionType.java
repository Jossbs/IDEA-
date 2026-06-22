package com.idea.exam.domain;

/**
 * Kind of question (the polymorphic question model). Stored as its {@code name()}
 * string in {@code questions.question_type}.
 */
public enum QuestionType {
    SINGLE_CHOICE,
    MULTIPLE_CHOICE,
    TRUE_FALSE,
    SHORT_TEXT
}
