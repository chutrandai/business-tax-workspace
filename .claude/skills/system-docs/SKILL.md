---
name: system-docs
description: Generate a complete set of system design and business documentation in the /docs directory of any project. Use when starting a new project, onboarding to vibe coding, creating technical specifications, or when the user asks to generate project documentation, PRD, architecture docs, database schema, backlog, user stories, SRS, or any system design artifacts. Triggers on requests like "create docs", "generate documentation", "set up project specs", "write PRD", "create backlog", "design system architecture".
---

# System Documentation Generator

Generate a structured documentation suite in `/docs` to serve as the single source of truth for vibe coding workflows. The skill produces two groups of documents: **System Design & Data** and **Business Management**.

## Output Structure

```
/docs/
├── PRD.md                                    # Product Requirements Document
├── SDD.md                                    # System Design Document (detailed)
├── architecture/
│   ├── tech-stack.md                         # Technology & versions
│   ├── architecture.md                       # System architecture (high-level)
│   ├── database-schema.md                    # Tables, relations, constraints
│   └── database_schema_assets/              # (chỉ tạo khi có > 20 bảng)
│       ├── [group-name].md                   # Nhóm bảng theo chức năng
│       └── ...                               # Mỗi file = 1 nhóm chức năng
└── business/
    ├── MASTER_BACKLOG.md                     # All Epics & Features (P0/P1/P2)
    ├── DOD.md                                # Definition of Done
    ├── SRS_MASTER.md                         # Software Requirements Spec (master)
    └── features/
        └── [feature-name]/
            ├── USER_STORIES.md               # Detailed user stories
            ├── SPRINT.json                   # Sprint progress tracking
            └── SRS_EXT.md                    # Extended requirements spec
```

> **Lưu ý `database_schema_assets/`:** Thư mục này chỉ được tạo khi tổng số bảng trong schema **vượt quá 20 bảng**. Khi tạo, các bảng được nhóm theo domain/chức năng (ví dụ: `users.md`, `transactions.md`, `notifications.md`). File `database-schema.md` chính giữ ER diagram tổng quan và link đến từng file nhóm bằng relative link.

## Workflow

Documentation generation follows 3 sequential phases. Complete each phase before moving to the next.

### Phase 1 — Project Discovery

Gather project context before generating any files. Ask the user for:

1. **Project name & domain** (e.g., "E-Invoice Management System")
2. **Core problem statement** — what does the product solve?
3. **Target users** — who are the primary user personas?
4. **Tech stack** — languages, frameworks, databases, infrastructure (or ask if they want recommendations)
5. **Key features/epics** — top-level feature list with rough priority (P0/P1/P2)
6. **Existing codebase?** — if yes, scan the project to auto-detect tech stack and structure

If the project already has code, use `list_dir`, `view_file`, and `grep_search` to discover:
- Package managers & dependencies (package.json, pom.xml, build.gradle, etc.)
- Framework conventions (Spring Boot, Next.js, Django, etc.)
- Existing database models or migrations
- Existing documentation in `/docs`

> **Important**: Do NOT overwrite existing `/docs` files without explicit user approval.

### Phase 2 — Group 1: System Design & Data

Generate system-level documentation. Read `references/group1-system-design.md` for detailed template structures and writing guidelines.

**File generation order** (dependencies flow top-down):

1. **PRD.md** — Start here. Defines the product scope that all other docs reference.
2. **architecture/tech-stack.md** — Lock down technology choices referenced by architecture docs.
3. **architecture/architecture.md** — High-level system architecture with Mermaid diagrams.
4. **SDD.md** — Detailed component design, API contracts, sequence diagrams.
5. **architecture/database-schema.md** — ER diagrams, table definitions, relationships, constraints.

For each file:
1. Copy the template from `assets/templates/` to the appropriate destination:
   - `tech-stack.md`, `architecture.md`, `database-schema.md` → `/docs/architecture/`
   - `PRD.md`, `SDD.md` → `/docs/`
2. Fill in project-specific content based on Phase 1 discovery
3. Add Mermaid diagrams where applicable (architecture, database, sequences)
4. Cross-reference related documents using relative links

**Database schema split rule (> 20 tables):**

After generating `architecture/database-schema.md`, count the total number of tables:
- **≤ 20 tables**: Keep everything in `database-schema.md`. No action needed.
- **> 20 tables**: Create `/docs/architecture/database_schema_assets/` and:
  1. Group tables by functional domain (e.g., `users-auth.md`, `transactions.md`, `notifications.md`, `audit-logs.md`).
  2. Each group file contains: table definitions, columns, constraints, and a local ER diagram for that group.
  3. In `database-schema.md` (main file): keep only the **overall ER diagram** and a **reference table** that lists each group with a link and a short description of the tables it contains.
  4. Use relative links from `database-schema.md` → `database_schema_assets/[group].md`.
  5. Aim for groups of 4–8 tables each for readability.

### Phase 3 — Group 2: Business Management

Generate business-level documentation. Read `references/group2-business.md` for detailed template structures and writing guidelines.

**File generation order:**

1. **MASTER_BACKLOG.md** — Epic/Feature breakdown with priorities
2. **DOD.md** — Definition of Done standards
3. **SRS_MASTER.md** — Master software requirements specification
4. **Feature directories** — For each feature identified in the backlog:
   - Create `/docs/business/features/[feature-name]/`
   - Generate `USER_STORIES.md` with detailed user stories
   - Generate `SPRINT.json` with initial sprint structure
   - Generate `SRS_EXT.md` with extended requirements

Feature directory names use `kebab-case` (e.g., `user-authentication`, `invoice-management`).

## Cross-Referencing Rules

All documents must cross-reference each other where relevant:

- `PRD.md` → links to features in `MASTER_BACKLOG.md`
- `architecture/architecture.md` → references tech choices from `architecture/tech-stack.md`
- `SDD.md` → references architecture from `architecture/architecture.md`, tables from `architecture/database-schema.md`
- `MASTER_BACKLOG.md` → links to feature directories in `features/`
- `USER_STORIES.md` → references requirements from `SRS_MASTER.md` and `SRS_EXT.md`
- `SRS_EXT.md` → references tables from `architecture/database-schema.md`
- `architecture/database-schema.md` → links to group files in `database_schema_assets/` (when applicable)

Use relative markdown links:
- From `/docs/`: `[Architecture](architecture/architecture.md)`
- From `/docs/architecture/`: `[Tech Stack](tech-stack.md)`, `[DB Group](database_schema_assets/transactions.md)`
- From `/docs/business/features/[name]/`: `[Schema](../../../architecture/database-schema.md)`

## Updating Existing Docs

When the user modifies code or adds features after initial generation:

1. Identify which documents are affected by the change
2. Update all affected documents to maintain consistency
3. If a new feature is added, create its feature directory with all 3 files
4. Update `MASTER_BACKLOG.md` to reflect the new feature
5. Never allow code implementation to drift from documentation

## Templates

Template files are available in `assets/templates/`. Copy them as starting points and fill in project-specific content. Do not use templates as-is — they contain placeholder text that must be replaced.
