# IDEA — Architecture Overview

> Status: approved baseline (v0.1). Evolves as data dictionaries arrive.

## 1. Goals

- Let teachers author, publish and grade exams with minimal admin overhead.
- Give students a fluid exam experience that **survives disconnections**
  (server-authoritative timer + autosave + reconnection).
- Guarantee data integrity and handle concurrent exam sessions.

## 2. Container View

```
Browser (React/Vite)  ──HTTPS/REST + JWT──>  API (Spring Boot 3, Java 21)
                                                  │
                              ┌───────────────────┴───────────────────┐
                              ▼                                       ▼
                        PostgreSQL                                 Redis
                   (durable source of truth)                 (hot live state:
                    exams, attempts, results)             session, timer, autosave)
```

**Guiding principle:** PostgreSQL is the **durable truth**; Redis is the
**hot truth** during an active attempt. The server is the sole authority for
time and grading — the client is never trusted.

## 3. Backend — Modular Monolith

Chosen over microservices for an MVP with a small team: ACID-local
transactions, low-latency timer/autosave, single deployable, and clear module
seams ready for future extraction.

| Module    | Responsibility                                                      |
|-----------|--------------------------------------------------------------------|
| `auth`    | Identity, JWT, registration/login, roles (`TEACHER`/`STUDENT`)     |
| `exam`    | Exams, subjects catalog and the polymorphic question model         |
| `attempt` | Attempt lifecycle, server-authoritative timer, Redis autosave      |
| `grading` | Automatic (choice/true-false), keyword (short text), manual grading|
| `shared`  | Security/Redis/JPA config, error handling (ProblemDetail), utils   |

**Boundary rules:** modules talk through public service interfaces only —
never another module's JPA repositories. Enforced with ArchUnit tests
(planned).

## 4. Frontend — Feature-based React

```
src/
  app/            router + global providers (QueryClient, Theme, Auth)
  design-system/  tokens (60-30-10 palette) + reusable UI primitives
  features/       auth · exam-builder · exam-runner · results-dashboard
  lib/            api client (TanStack Query) + auth/JWT helpers
  store/          Zustand UI state
  shared/         utils, constants, common types
```

Server state via **TanStack Query**, light UI state via **Zustand**. The
visual identity lives in one place (`design-system/tokens`); no component
hardcodes a hex value.

### Visual identity — 60-30-10 design tokens

| Role             | Token               | Color     |
|------------------|---------------------|-----------|
| Surface / base   | `--color-surface`   | `#F8F9FA` |
| Primary (60%)    | `--color-primary`   | `#005F73` |
| Secondary (30%)  | `--color-secondary` | `#22333B` |
| Accent (10%)     | `--color-accent`    | `#CA6702` |
| Success feedback | `--color-success`   | `#0A9396` |
| Danger feedback  | `--color-danger`    | `#AE2012` |

## 5. The core: Timer + Autosave + Reconnection (Redis)

```
attempt:{id}:meta     HASH  { startedAt, expiresAt, status }   TTL = duration + margin
attempt:{id}:answers  HASH  { questionId -> json(answer) }      TTL = duration + margin
session:{userId}      live session / refresh tracking
```

- **Timer:** server fixes `expiresAt` at start; client shows a local
  countdown but periodically heartbeats to resync with the server's real
  `secondsRemaining`. Submit re-validates `now <= expiresAt`.
- **Autosave:** each answer (debounced) writes to Redis; a periodic flush
  persists to PostgreSQL; final submit guarantees the flush.
- **Reconnection:** on return, `GET /attempts/{id}/state` rehydrates exact
  remaining time + all saved answers from Redis.
- **Durability:** Redis AOF in production + periodic Postgres flush as the
  ultimate safety net.

## 6. Database Conventions (from data dictionaries)

- UUID primary keys (non-sequential, secure).
- Verbose `snake_case` field names (e.g. `creation_timestamp`).
- Soft-delete via `is_active_record` (no destructive deletes).
- Audit trail: `creation_timestamp` + `update_timestamp` on every entity.
- i18n-ready: optional `translated_*` fields where bilingual display applies.

## 7. Open Questions (pending briefing)

- Anti-cheat: question/option shuffling, single attempt per student?
- Reusable question bank vs. exam-scoped questions?
- Course / group concept between teacher and students?
