package com.idea;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Smoke test: verifies the Spring application context starts.
 * Requires PostgreSQL and Redis to be reachable (e.g. `docker compose up -d`).
 */
@SpringBootTest
class IdeaApplicationTests {

    @Test
    void contextLoads() {
    }
}
