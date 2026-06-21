/**
 * Attempt module — the core of taking an exam.
 *
 * <p>Owns the attempt lifecycle, the server-authoritative timer and the
 * Redis-backed autosave/reconnection flow. PostgreSQL is the durable source
 * of truth; Redis holds the hot state of an in-progress attempt.</p>
 */
package com.idea.attempt;
