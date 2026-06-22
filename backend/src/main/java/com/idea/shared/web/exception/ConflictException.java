package com.idea.shared.web.exception;

/**
 * Thrown when a request conflicts with the current state of a resource
 * (e.g. editing an exam that already has submissions). Mapped to HTTP 409.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
