package com.idea.shared.web.exception;

/**
 * Thrown when creating or updating a resource would violate a uniqueness rule
 * (e.g. a duplicate subject name). Mapped to HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
