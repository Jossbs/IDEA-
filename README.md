# IDEA — Digital Interface for Academic Evaluation

A web platform that helps teachers digitize, automate and manage academic
exams — reducing administrative workload and giving students a smooth,
disconnection-resilient exam experience.

## Tech Stack

| Layer            | Technology                                            |
|------------------|-------------------------------------------------------|
| Frontend         | React + Vite + TypeScript                             |
| Backend          | Java 21 + Spring Boot 3 (modular monolith)            |
| Database         | PostgreSQL                                            |
| Cache / Live state | Redis (sessions, exam timer, autosave, reconnection) |
| Infrastructure   | Docker + Docker Compose                              |

## Architecture

A **modular monolith** on the backend with explicit module boundaries
(`auth`, `exam`, `attempt`, `grading`, `shared`) and a **feature-based**
React frontend with a centralized design system.

See [`docs/architecture.md`](docs/architecture.md) for the full plan.

## Getting Started

> Scaffolding in progress. Once services are wired:
>
> ```bash
> cp .env.example .env      # fill in local values
> docker compose up         # start postgres, redis, backend, frontend
> ```

## Project Conventions

- **Naming:** verbose `snake_case` in the database (e.g. `creation_timestamp`),
  UUID primary keys, soft-delete via `is_active_record`, audit timestamps on
  every entity.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `chore:`, `docs:`, `build:`, `refactor:`, `test:`).
- **Branching:** stable `main` + `feature/<scope>` branches merged via PR.
- **Language:** all code, comments and commit messages in English.
