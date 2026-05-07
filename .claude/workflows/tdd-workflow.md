---
description: **Trigger:** When the user requests to implement a new feature, API endpoint, mapper, or bug fix in the backend services.
---

**Execution Steps:**

1. **Analyze Requirements & Determine Tech Stack:**
   - Read the relevant documentation in `/docs` to detail the Test Cases to be written (Happy path, Edge cases, Exception handling, or UI Behavior).
   - **Crucial:** Identify the environment of the target code (Spring Boot, Next.js, or React.js).

2. **Execute Phase 1: RED (Write Tests)**
   - Based on the identified tech stack, call the exact appropriate skill, passing the Test Cases Artifact:
     * Call `@skill:springboot-unit-test` (for Java/Spring Boot).
     * Call `@skill:nextjs-vitest` (for Next.js frontend).
     * Call `@skill:reactjs-vitest` (for React.js/Vite frontend).
   - Generate the test file strictly following the skill's specific guidelines.
   - Run the environment-specific test command:
     * *Java:* Maven/Gradle test command for that specific file.
     * *Frontend:* `npm run test`, `yarn test`, or `npx vitest` for that specific file.
   - Confirm in the terminal that the tests FAIL (Red).

3. **Execute Phase 2: GREEN (Write Implementation)**
   - Modify the production code (`.java`, `.ts`, or `.tsx`) to implement the business logic or UI requirements.
   - Run the test command again automatically.
   - Iterate on fixing the code until the terminal outputs BUILD SUCCESS or PASS (Green).

4. **Execute Phase 3: REFACTOR**
   - Review the newly written production code.
   - Check against `project-rules.md` (e.g., Database Integrity, API Contract, Component structure).
   - Refactor for cleanliness and performance.
   - Run tests one final time to ensure they are still Green.

5. **Final Output:**
   - Present a summary of the implemented code and the test execution results to the user.