package com.idea.exam.dto;

import java.util.UUID;

/**
 * Student-facing option: deliberately WITHOUT {@code isCorrect} so the answer
 * key never reaches the client (anti-cheat). Mirrors the frontend StudentOption.
 */
public record StudentOptionResponse(
        UUID optionId,
        String optionText) {
}
