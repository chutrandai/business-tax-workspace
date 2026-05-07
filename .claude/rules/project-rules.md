---
trigger: always_on
---

## I. Documentation & Knowledge Base
1. **Single Source of Truth:** All project documentation, specifications, and architecture decisions must reside in the `/docs` directory.
2. **Sync-on-Change Protocol:**
   - Any changes to business logic, code refactoring, or data models MUST be immediately reflected in the corresponding documentation within `/docs`.
   - Never allow code implementation to drift from the documentation.
   -> 🚨 **MANDATORY SKILL USAGE:** Whenever creating, updating, or modifying any project rules, documentation, or skill instructions within the `/docs` directory, the Agent MUST strictly invoke the predefined skill `@skill:system-docs` to execute the update.
3. **Artifact Formatting:** All AI-generated artifacts (execution plans, flowcharts, sequence diagrams) must be saved as **Markdown** or **Mermaid Charts** within `/docs` to ensure readability and visualization.

## II. Development Workflow & Integrity
4.  **Atomic Commits & Task ID:**
    - Every code change must be atomic and associated with a specific Task ID from the Agent Manager.
    - Do not bundle multiple large features or unrelated fixes into a single commit/task.
5.  **API Contract First:**
    - Any modification to API endpoints (Request/Response structure) requires an immediate update to the API Specifications (OpenAPI/Swagger) in `/docs/api`.
    - The API implementation must strictly adhere to the defined contract.
6.  **Database Integrity:**
    - Changes to the Database Schema (Models/Entities) must include a corresponding **Migration Script**.
    - Never modify ORM models without ensuring the database migration path is valid and rollback-able.
7.  **Stack Consistency:**
    - Do NOT arbitrarily install new dependencies or libraries.
    - Prioritize using existing project utilities or standard libraries. If a new package is absolutely necessary, request explicit user approval first.

## III. Quality Assurance & Strictly Enforced TDD
8. **Strict Test-Driven Development (TDD) Lifecycle:**
   - All AI Agents MUST strictly execute the **RED -> GREEN -> REFACTOR** cycle for ANY new feature, bug fix, logic modification, or UI component creation across ALL project modules (Backend & Frontend).
   - **Phase 1 - RED (Test First):** Before writing or modifying ANY production code (Java or TS/TSX), the Agent MUST write the corresponding test cases.
     -> 🚨 **MANDATORY SKILL USAGE (Dynamic Selection):** In this phase, the Agent MUST identify the technology stack of the target module and invoke the EXACT corresponding predefined skill:
        * If working in a **Spring Boot** module: Invoke `@skill:springboot-unit-test`.
        * If working in a **Next.js** module (App/Pages router): Invoke `@skill:nextjs-vitest`.
        * If working in a pure **React.js / Vite** module: Invoke `@skill:reactjs-vitest`.
     - The generated tests MUST fail initially. The Agent must run the test command to verify the failure (Red).
   - **Phase 2 - GREEN (Implement):** Only after the tests are written and confirmed failing, the Agent writes the minimal production code necessary to make the tests PASS.
   - **Phase 3 - REFACTOR:** Clean up the code, apply design patterns, and ensure tests remain 100% PASS.
9. **Zero-Bypass Policy:**
   - Agents are forbidden from marking a task as "Complete" if the test coverage is missing, skipped, or if tests are failing.
   - If the Agent is stuck in the "RED" phase for more than 3 iterative loops, it MUST stop and ask the human engineer for clarification.