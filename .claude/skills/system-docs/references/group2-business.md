# Group 2: Business Management — Writing Guidelines

## Table of Contents

1. [MASTER_BACKLOG.md](#master_backlogmd)
2. [DOD.md](#dodmd)
3. [SRS_MASTER.md](#srs_mastermd)
4. [Feature Directory Structure](#feature-directory-structure)
   - [USER_STORIES.md](#user_storiesmd)
   - [SPRINT.json](#sprintjson)
   - [SRS_EXT.md](#srs_extmd)

---

## MASTER_BACKLOG.md

**Purpose**: Single overview of all Epics and Features with priorities and status. This is the project roadmap for development.

### Required Sections

| Section | Content |
|---------|---------|
| Overview | One-paragraph project roadmap summary |
| Priority Legend | P0/P1/P2 definitions |
| Epic Table | All epics with priority, status, feature count |
| Feature Breakdown | Features grouped by epic with links |

### Epic/Feature Table Format

```markdown
## Epics Overview

| # | Epic | Priority | Status | Features | Directory |
|---|------|----------|--------|----------|-----------|
| E1 | User Authentication | P0 | In Progress | 3 | [features/user-auth](features/user-auth/) |
| E2 | Invoice Management | P0 | Not Started | 5 | [features/invoice-mgmt](features/invoice-mgmt/) |
| E3 | Reporting Dashboard | P1 | Not Started | 4 | [features/reporting](features/reporting/) |

## E1: User Authentication

| ID | Feature | Priority | Status | Story Points |
|----|---------|----------|--------|-------------|
| F1.1 | Email/Password Login | P0 | Done | 5 |
| F1.2 | OAuth2 Integration | P1 | In Progress | 8 |
| F1.3 | 2FA Setup | P2 | Not Started | 5 |
```

### Status Values
- `Not Started` — No work begun
- `In Progress` — Active development
- `Done` — Meets DOD criteria
- `Blocked` — Waiting on dependency (note the blocker)

### Writing Tips
- Order epics by priority (P0 first)
- Link each feature directory to its `features/[name]/` path
- Update this file whenever features are added, completed, or re-prioritized
- Keep feature descriptions to one line

---

## DOD.md

**Purpose**: Define the "Definition of Done" checklist that every feature must satisfy before marking as complete.

### Required Sections

| Section | Content |
|---------|---------|
| Code Standards | Coding & review requirements |
| Testing | Test coverage & types required |
| Documentation | Which docs must be updated |
| Deployment | Deployment & rollback readiness |
| Acceptance | Stakeholder acceptance criteria |

### Checklist Format

```markdown
## Definition of Done

A feature is considered "Done" when ALL of the following are satisfied:

### Code
- [ ] Code follows project coding standards
- [ ] Code reviewed and approved by at least 1 reviewer
- [ ] No critical or high-severity static analysis warnings
- [ ] All TODO/FIXME items resolved or tracked in backlog

### Testing
- [ ] Unit tests written and passing (≥80% coverage)
- [ ] Integration tests written and passing
- [ ] Edge cases and error paths tested
- [ ] No regression in existing tests

### Documentation
- [ ] API documentation updated (if API changed)
- [ ] `database-schema.md` updated (if schema changed)
- [ ] `SDD.md` updated (if design changed)
- [ ] User stories marked as completed in `USER_STORIES.md`

### Deployment
- [ ] Feature deployable to staging environment
- [ ] Database migrations tested and reversible
- [ ] Environment variables documented
- [ ] Rollback procedure verified
```

### Writing Tips
- Keep checklist items binary (done/not done)
- Customize for the project's actual CI/CD pipeline
- Include DOD for different artifact types if needed (API, UI, DB migration)

---

## SRS_MASTER.md

**Purpose**: Master Software Requirements Specification covering system-wide functional and non-functional requirements, constraints, and assumptions.

### Required Sections

| Section | Content |
|---------|---------|
| Introduction | Purpose, scope, definitions, acronyms |
| System Overview | High-level system description |
| Functional Requirements | System-wide functional requirements |
| Non-Functional Requirements | Performance, security, scalability, etc. |
| External Interfaces | User, hardware, software, communication interfaces |
| Constraints | Technical, regulatory, business constraints |
| Assumptions & Dependencies | What we assume to be true |

### Non-Functional Requirements Format

```markdown
## Non-Functional Requirements

### Performance
| ID | Requirement | Target | Priority |
|----|------------|--------|----------|
| NFR-P01 | API response time (p95) | < 200ms | P0 |
| NFR-P02 | Page load time | < 2s | P0 |
| NFR-P03 | Concurrent users supported | 1,000 | P1 |

### Security
| ID | Requirement | Target | Priority |
|----|------------|--------|----------|
| NFR-S01 | Authentication | JWT with refresh tokens | P0 |
| NFR-S02 | Data encryption at rest | AES-256 | P0 |
| NFR-S03 | OWASP Top 10 compliance | Full coverage | P0 |
```

### Writing Tips
- Use unique IDs for traceability (FR-xxx, NFR-xxx)
- Link to feature-level `SRS_EXT.md` for detailed requirements
- Keep system-wide constraints here; feature-specific constraints go in `SRS_EXT.md`
- Reference `database-schema.md` for data-related requirements

---

## Feature Directory Structure

Each feature gets its own directory: `/docs/business/features/[feature-name]/`

Directory naming: use `kebab-case` (e.g., `user-authentication`, `invoice-management`).

---

### USER_STORIES.md

**Purpose**: Detailed user stories for a specific feature with acceptance criteria and task breakdown.

### User Story Format

```markdown
# Feature: [Feature Name]

**Epic**: [Link to epic in MASTER_BACKLOG.md]
**Priority**: P0/P1/P2
**Story Points**: [Total]

---

## US-001: [Story Title]

**As a** [user role],
**I want** [action/goal],
**So that** [benefit/value].

### Acceptance Criteria

```gherkin
Given [initial context]
When [action is performed]
Then [expected outcome]
And [additional outcome]
```

### Tasks
- [ ] Task 1: [Description] — [Estimated hours]
- [ ] Task 2: [Description] — [Estimated hours]

### Dependencies
- Depends on: [US-xxx] or [External system]

### Notes
- [Any additional context or constraints]
```

### Writing Tips
- One user story per functional behavior
- Acceptance criteria in Gherkin format (Given/When/Then)
- Break stories small enough to complete in one sprint
- Link back to `SRS_MASTER.md` and `SRS_EXT.md` requirement IDs

---

### SPRINT.json

**Purpose**: Machine-readable sprint tracking for the feature. Allows automated progress dashboards and AI-assisted sprint planning.

### Schema

```json
{
  "feature": "feature-name",
  "sprints": [
    {
      "id": 1,
      "name": "Sprint 1",
      "goal": "Core functionality for [feature]",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "status": "completed | active | planned",
      "stories": [
        {
          "id": "US-001",
          "title": "Story title",
          "status": "done | in_progress | todo | blocked",
          "assignee": "",
          "story_points": 3,
          "tasks_completed": 2,
          "tasks_total": 3,
          "notes": ""
        }
      ],
      "velocity": 0,
      "retrospective": ""
    }
  ]
}
```

### Status Values
- **Sprint**: `planned` → `active` → `completed`
- **Story**: `todo` → `in_progress` → `done` (or `blocked`)

### Writing Tips
- Create initial sprint with all stories in `todo` status
- Update `velocity` after sprint completion (sum of completed story points)
- Use `retrospective` to record lessons learned
- Keep `notes` for blockers or scope changes

---

### SRS_EXT.md

**Purpose**: Extended requirements specification for a specific feature. Contains detailed functional requirements, business rules, data requirements, and validation rules that are too granular for `SRS_MASTER.md`.

### Required Sections

| Section | Content |
|---------|---------|
| Feature Overview | Brief description and link to epic |
| Functional Requirements | Detailed feature requirements |
| Business Rules | Domain-specific logic and rules |
| Data Requirements | Input/output data specs, validation |
| UI/UX Requirements | Interface specifications (if applicable) |
| Integration Points | External systems this feature interacts with |
| Error Scenarios | Error conditions and expected behavior |

### Functional Requirements Format

```markdown
## Functional Requirements

| ID | Requirement | Priority | Linked Story |
|----|-------------|----------|-------------|
| FR-INV-001 | System shall validate invoice number format (INV-YYYYMMDD-XXXX) | P0 | US-001 |
| FR-INV-002 | System shall auto-calculate tax based on item category | P0 | US-002 |
| FR-INV-003 | System shall support bulk invoice upload via CSV | P1 | US-005 |
```

### Writing Tips
- Use feature-scoped IDs (e.g., FR-INV-xxx for invoice features)
- Link requirements back to user stories in `USER_STORIES.md`
- Document all validation rules and business logic
- Reference `database-schema.md` tables that support these requirements
