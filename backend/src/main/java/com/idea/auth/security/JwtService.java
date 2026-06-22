package com.idea.auth.security;

import com.idea.auth.domain.Role;
import com.idea.auth.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

/**
 * Issues and validates the stateless JWTs. Two token types share one signing
 * key but differ in the {@code type} claim and lifetime: {@code access} (short,
 * carries role) and {@code refresh} (long, used only to mint new access tokens).
 */
@Service
public class JwtService {

    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_EMAIL = "email";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";

    private final SecretKey key;
    private final long accessExpirationMinutes;
    private final long refreshExpirationDays;

    public JwtService(JwtProperties properties) {
        this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMinutes = properties.accessExpirationMinutes();
        this.refreshExpirationDays = properties.refreshExpirationDays();
    }

    public String generateAccessToken(User user) {
        return build(user, TYPE_ACCESS, Instant.now().plus(accessExpirationMinutes, ChronoUnit.MINUTES))
                .compact();
    }

    public String generateRefreshToken(User user) {
        return build(user, TYPE_REFRESH, Instant.now().plus(refreshExpirationDays, ChronoUnit.DAYS))
                .compact();
    }

    private io.jsonwebtoken.JwtBuilder build(User user, String type, Instant expiry) {
        return Jwts.builder()
                .subject(user.getUserId().toString())
                .claim(CLAIM_EMAIL, user.getEmail())
                .claim(CLAIM_ROLE, user.getRole().name())
                .claim(CLAIM_TYPE, type)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(expiry))
                .signWith(key);
    }

    /** Parses and verifies a signed token, returning its claims. Throws on any invalidity. */
    private Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    /** Validates an access token and maps it to a principal. Throws if invalid/expired/wrong type. */
    public AuthenticatedUser parseAccessToken(String token) {
        Claims claims = parse(token);
        if (!TYPE_ACCESS.equals(claims.get(CLAIM_TYPE, String.class))) {
            throw new IllegalArgumentException("Not an access token.");
        }
        return new AuthenticatedUser(
                UUID.fromString(claims.getSubject()),
                claims.get(CLAIM_EMAIL, String.class),
                Role.valueOf(claims.get(CLAIM_ROLE, String.class)));
    }

    /** Validates a refresh token and returns the subject (user id). Throws if invalid/expired/wrong type. */
    public UUID parseRefreshSubject(String token) {
        Claims claims = parse(token);
        if (!TYPE_REFRESH.equals(claims.get(CLAIM_TYPE, String.class))) {
            throw new IllegalArgumentException("Not a refresh token.");
        }
        return UUID.fromString(claims.getSubject());
    }
}
