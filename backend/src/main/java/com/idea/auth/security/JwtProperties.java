package com.idea.auth.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * JWT settings bound from {@code app.jwt.*} (which read the JWT_* env vars).
 *
 * @param secret                 HMAC-SHA signing key (>= 32 bytes for HS256)
 * @param accessExpirationMinutes lifetime of an access token
 * @param refreshExpirationDays   lifetime of a refresh token
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secret,
        long accessExpirationMinutes,
        long refreshExpirationDays) {
}
