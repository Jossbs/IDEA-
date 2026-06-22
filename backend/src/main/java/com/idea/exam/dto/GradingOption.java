package com.idea.exam.dto;

import java.util.UUID;

/** One answer option in the grading model: its text and whether it is correct. */
public record GradingOption(UUID optionId, String optionText, boolean correct) {
}
