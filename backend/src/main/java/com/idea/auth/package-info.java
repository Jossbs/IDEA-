/**
 * Authentication &amp; identity module.
 *
 * <p>Owns users, roles ({@code TEACHER} / {@code STUDENT}), registration,
 * login and JWT issuance/refresh. Exposes a public security contract that the
 * other modules depend on — never the reverse.</p>
 */
package com.idea.auth;
