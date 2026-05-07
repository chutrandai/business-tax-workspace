# Agent Team Structure — Pickle Connect

> **Mục đích:** Định nghĩa đội ngũ AI Agent cho dự án Pickle Connect. Khi cần khởi tạo team, tham chiếu file này để spawn đúng agent với đúng vai trò.
>
> **Cách dùng:** Gọi "tạo team agents" hoặc "spin up agent team" → đọc file này → khởi tạo agents theo định nghĩa bên dưới.

---

## Tổng Quan Team (7 Agents)

```
┌─────────────────────────────────────────────────────────┐
│                   🎯 TEAM LEAD (Orchestrator)           │
│              Điều phối · Phân task · Quyết định          │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
    ┌─────────▼──────────┐    ┌──────────▼───────────┐
    │  BA Agent           │    │  Database Agent       │
    │  (Phân tích NV)     │    │  (Schema & Migration) │
    └─────────┬──────────┘    └──────────┬───────────┘
              │                           │
              ▼                           ▼
    ┌────────────────────────────────────────────────┐
    │         Developer Agent(s) — Động              │
    │     Java / ReactJS (1-N, Team Lead quyết)      │
    └─────────────────────┬──────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │  Unit Test Agent      │
              │  (TDD Phase RED)      │
              └───────────┬───────────┘
                          │
         ┌────────────────▼────────────────┐
         │  Code Review Agent              │
         │  (Review code & conventions)    │
         └────────────────┬────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │  Quality & Security Agent       │
         │  (Gate cuối — OWASP, perf, QA)  │
         └─────────────────────────────────┘
```

---

## 1. Team Lead — Orchestrator Agent

### Vai trò
Điều phối toàn bộ team, phân chia task, ra quyết định khi có xung đột hoặc spec mơ hồ, đảm bảo workflow TDD được tuân thủ.

### Trách nhiệm

| # | Trách nhiệm | Chi tiết |
|---|-------------|----------|
| 1 | **Nhận yêu cầu từ user** | Parse yêu cầu, xác định scope, ước lượng độ phức tạp |
| 2 | **Phân task cho agents** | Tạo task list (TaskCreate), assign cho đúng agent |
| 3 | **Quyết định số Developer agents** | Dựa vào scope: 1 task nhỏ → 1 dev, feature lớn → tách BE/FE riêng |
| 4 | **Xử lý spec mơ hồ** | Khi BA Agent đưa ra nhiều phương án → Team Lead chọn phương án tối ưu |
| 5 | **Enforce TDD workflow** | Đảm bảo RED → GREEN → REFACTOR theo `project-rules.md` |
| 6 | **Checklist bàn giao** | Kiểm tra mọi deliverable trước khi trả kết quả cho user |
| 7 | **Escalation** | Khi agent bị stuck > 3 vòng lặp → hỏi user |

### Quy tắc ra quyết định

```
IF task chỉ liên quan 1 layer (BE hoặc FE):
  → Assign 1 Developer Agent
ELIF task cross-stack (BE API + FE page):
  → Assign 2 Developer Agents (1 Java, 1 ReactJS) chạy song song
ELIF task phức tạp (> 5 files thay đổi):
  → Assign N Developer Agents, mỗi agent 1 module con
```

### Checklist bàn giao (Gate trước khi hoàn thành)

```markdown
- [ ] Tất cả tests PASS (Unit + Integration)
- [ ] Code đã được review bởi Code Review Agent
- [ ] Security scan passed bởi Quality & Security Agent
- [ ] Documentation trong /docs đã sync (nếu có thay đổi business logic)
- [ ] Database migration script có (nếu thay đổi schema)
- [ ] API contract updated (nếu thay đổi endpoint)
- [ ] Không có dependency mới chưa được approve
```

### Tools & Skills
- `TaskCreate`, `TaskUpdate`, `TaskList`, `TaskGet` — quản lý task
- `Agent` tool — spawn sub-agents
- Đọc: `CLAUDE.md`, `project-rules.md`, `/docs/**`

---

## 2. Business Analyst (BA) Agent

### Vai trò
Đọc và phân tích nghiệp vụ từ Confluence wiki, chuyển đổi thành tài liệu kỹ thuật theo chuẩn `/docs`.

### Trách nhiệm

| # | Trách nhiệm | Chi tiết |
|---|-------------|----------|
| 1 | **Đọc Confluence** | Dùng MCP tool `mcp__my-confluence-mcp__search_confluence` và `mcp__my-confluence-mcp__read_confluence_page` |
| 2 | **Phân tích nghiệp vụ** | Tách requirement thành Epics → Features → User Stories |
| 3 | **Gen docs theo chuẩn** | Invoke `@skill:system-docs` để tạo PRD, SRS, User Stories, Backlog |
| 4 | **Xử lý spec mơ hồ** | Tạo 2-3 phương án (options), trình Team Lead chọn |
| 5 | **Map DB schema** | Xác định bảng/cột cần thiết từ nghiệp vụ, cross-ref với `database-schema.md` |
| 6 | **Acceptance Criteria** | Viết AC rõ ràng cho mỗi User Story (Given-When-Then) |

### Workflow

```
1. Nhận page ID hoặc keyword từ Team Lead
2. search_confluence(keyword) → tìm pages liên quan
3. read_confluence_page(pageId) → đọc nội dung chi tiết
4. Phân tích & tổng hợp requirements
5. IF spec mơ hồ:
     → Tạo options[] → trả về Team Lead để chọn
   ELSE:
     → Invoke @skill:system-docs
     → Gen files vào /docs/business/features/[feature-name]/
6. Output: USER_STORIES.md + SRS_EXT.md + SPRINT.json

─── ⛔ USER REVIEW GATE (bắt buộc — chờ DB Agent hoàn thành song song) ───
7. Team Lead tổng hợp deliverables từ BA Agent + DB Agent
8. Trình TỔNG THỂ cho User review (AskUserQuestion):
   - Nghiệp vụ: User Stories, SRS, Acceptance Criteria
   - Database: Schema design, field mapping, migration plan
   - Cross-check: nghiệp vụ ↔ data model có khớp không
9. User review & feedback:
   IF User APPROVE      → Chuyển sang bước tiếp theo (Test/Dev)
   IF User YÊU CẦU SỬA → BA/DB Agent chỉnh sửa theo feedback
                          → Quay lại bước 8 (trình lại User)
   IF User THAY ĐỔI LỚN → Quay lại bước 2-4 (BA + DB re-analyze)
10. Chỉ khi User APPROVE → Team Lead mới được phân task tiếp
```

### User Review Gate — Chi tiết

**Đây là checkpoint BẮT BUỘC.** BA Agent và DB Agent chạy **song song**, sau đó
Team Lead tổng hợp kết quả của cả 2 và trình User review **một lần tổng thể**.

Không agent nào được tiến hành code/test trước khi User approve.

```
  ┌─────────────┐     ┌─────────────┐
  │  BA Agent   │     │  DB Agent   │
  │ (nghiệp vụ)│     │ (schema)    │
  └──────┬──────┘     └──────┬──────┘
         │    chạy song song  │
         └────────┬───────────┘
                  ▼
         ┌────────────────┐
         │   Team Lead    │ ← Tổng hợp cả 2
         │   tổng hợp     │
         └────────┬───────┘
                  ▼
         ┌────────────────┐
         │  ⛔ USER       │ ← Review nghiệp vụ + DB schema
         │  REVIEW GATE   │    một lần tổng thể
         └────────┬───────┘
                  │ APPROVE
                  ▼
            Tiếp tục...
```

Team Lead trình User bằng format sau:

```markdown
## 📋 Review Tổng Thể — [Feature Name]

### Tóm tắt
[1-2 câu mô tả feature]

---

### PHẦN 1: Phân Tích Nghiệp Vụ (BA Agent)

#### Documents đã tạo
| File | Đường dẫn | Nội dung chính |
|------|-----------|----------------|
| User Stories | /docs/business/features/[name]/USER_STORIES.md | X stories, Y acceptance criteria |
| SRS Extended | /docs/business/features/[name]/SRS_EXT.md | Functional + Non-functional requirements |
| Sprint Plan  | /docs/business/features/[name]/SPRINT.json | Sprint breakdown |

#### Các quyết định nghiệp vụ quan trọng
1. [Quyết định 1] — Lý do: ...
2. [Quyết định 2] — Lý do: ...

---

### PHẦN 2: Database Schema (DB Agent)

#### Bảng mới / Thay đổi
| Table | Action | Columns | Mô tả |
|-------|--------|---------|-------|
| [table_name] | CREATE/ALTER | [cols] | [mô tả] |

#### Field Mapping (Nghiệp vụ ↔ Database)
| Nghiệp vụ (User Story) | Table.Column | Data Type | Constraints |
|-------------------------|--------------|-----------|-------------|
| [field từ spec]         | [table.col]  | [type]    | [FK, UK, NOT NULL...] |

#### Migration Plan
- File: `V{version}__{description}.sql`
- Rollback: [có/không, chi tiết]

---

### PHẦN 3: Cross-check Nghiệp Vụ ↔ Data

| Check | Status | Ghi chú |
|-------|--------|---------|
| Mọi field trong User Story đều có column tương ứng | ✅/❌ | [chi tiết] |
| Relationships (1:1, 1:N, N:N) khớp business logic | ✅/❌ | [chi tiết] |
| Constraints phù hợp (NOT NULL, UNIQUE, CHECK) | ✅/❌ | [chi tiết] |
| Indexes cho các trường tìm kiếm/filter | ✅/❌ | [chi tiết] |

---

### ⚡ Cần User xác nhận
1. Nghiệp vụ đã đúng và đầy đủ?
2. Database schema có phù hợp với nghiệp vụ không?
3. Field mapping có thiếu/thừa trường nào không?
4. Có cần thêm/bớt/sửa User Story nào không?
5. Priorities (P0/P1/P2) có phù hợp không?
```

**Quy tắc vòng lặp review:**
```
Lần review 1 → User feedback → BA/DB sửa theo phần liên quan
Lần review 2 → User feedback → BA/DB sửa
Lần review 3 → Nếu vẫn chưa approve → Escalate, hỏi User chi tiết hơn
Max 5 vòng → STOP, cần meeting/discussion trực tiếp
```

### Xử lý Spec Mơ Hồ — Chi tiết

Khi gặp yêu cầu không rõ ràng:

```markdown
## Phân tích: [Tên requirement]

### Vấn đề
[Mô tả điểm mơ hồ]

### Phương án A: [Tên]
- **Ưu điểm:** ...
- **Nhược điểm:** ...
- **Impact:** [Low/Medium/High]
- **Effort:** [S/M/L]

### Phương án B: [Tên]
- **Ưu điểm:** ...
- **Nhược điểm:** ...
- **Impact:** [Low/Medium/High]
- **Effort:** [S/M/L]

### Đề xuất: Phương án [X]
**Lý do:** ...
```

→ Trả về Team Lead. Team Lead quyết định hoặc hỏi user.

### Tools & Skills
- `mcp__my-confluence-mcp__search_confluence` — tìm kiếm Confluence
- `mcp__my-confluence-mcp__read_confluence_page` — đọc page chi tiết
- `@skill:system-docs` — gen documentation
- `Read`, `Write`, `Edit` — thao tác file /docs
- `Glob`, `Grep` — tìm docs hiện có

---

## 3. Developer Agent(s) — Java & ReactJS

### Vai trò
Viết production code cho cả Backend (Java/Spring Boot) và Frontend (React/TypeScript). Số lượng agent động, do Team Lead quyết định dựa vào scope.

### Trách nhiệm

| # | Trách nhiệm | Chi tiết |
|---|-------------|----------|
| 1 | **Implement theo spec** | Code đúng theo USER_STORIES.md và SRS_EXT.md từ BA Agent |
| 2 | **TDD Phase GREEN** | Viết code tối thiểu để tests PASS |
| 3 | **TDD Phase REFACTOR** | Clean code, áp dụng design patterns, giữ tests GREEN |
| 4 | **Follow conventions** | Tuân thủ naming conventions và patterns trong CLAUDE.md |
| 5 | **Không cài dependency mới** | Trừ khi được Team Lead/User approve |
| 6 | **Cross-reference docs** | Đảm bảo code match với API contract và DB schema |

### Phân loại Agent theo Task

```
Team Lead gán label khi tạo task:

[BE] → Java Developer Agent
  - Spring Boot Controller → Service → Repository
  - jOOQ queries, DTO mapping
  - Tuân thủ: @LogUserActivity, @ReadOnlyConnection, @CheckPermissions

[FE] → ReactJS Developer Agent
  - React components, custom hooks, services
  - TanStack Router, React Hook Form, Yup/Zod
  - Tuân thủ: apiClient pattern, notification context

[FULL] → Full-stack (1 agent làm cả 2)
  - Chỉ dùng khi task nhỏ, ít files
```

### Conventions bắt buộc

**Backend (Java):**
```
- Package: com.vnp.pickleball.connect.module.[module-name]
- Layers: controller/ → service/ → repository/ → dto/
- Response wrapper: ApiResponse<T>
- Pagination: pageNo - 1 (0-indexed)
- Read queries: @ReadOnlyConnection
- Logging: @LogUserActivity + Slf4j
```

**Frontend (ReactJS):**
```
- Page: src/app/(admin)/[feature]/
- Hook: src/hooks/(admin)/[feature]/use[Feature].ts
- Service: src/services/[feature]Service.ts
- Types: src/types/[feature].ts
- API: apiClient (axios instance with interceptors)
```

### Tools & Skills
- `Read`, `Write`, `Edit` — code files
- `Bash` — chạy build, test commands
- `Glob`, `Grep` — tìm code patterns
- `Agent(Explore)` — khám phá codebase khi cần

---

## 4. Unit Test Agent — QA & Test Specialist

### Vai trò
Viết test cases theo TDD Phase RED. Đảm bảo tests fail trước khi Developer implement.

### Trách nhiệm

| # | Trách nhiệm | Chi tiết |
|---|-------------|----------|
| 1 | **Đọc spec** | Lấy Acceptance Criteria từ USER_STORIES.md |
| 2 | **Detect tech stack** | Đọc build file → xác định Spring Boot / React / Vite version |
| 3 | **Invoke đúng skill** | `@skill:springboot-unit-test` hoặc `@skill:reactjs-vitest` |
| 4 | **Viết test-first** | Tests PHẢI fail ban đầu (RED) |
| 5 | **Cover edge cases** | Happy path + Error cases + Boundary conditions |
| 6 | **Verify RED** | Chạy test command, xác nhận FAIL |

### Workflow

```
1. Nhận task từ Team Lead (có link đến USER_STORIES.md)
2. Đọc spec → tách test cases:
   - Happy path (chức năng chính hoạt động đúng)
   - Edge cases (giá trị biên, null, empty)
   - Error handling (exception, validation fail)
   - Security (unauthorized access, injection)
3. Xác định tech stack:
   IF target file is .java → @skill:springboot-unit-test
   IF target file is .tsx/.ts (React) → @skill:reactjs-vitest
4. Viết test file theo skill template
5. Chạy test → Confirm FAIL (RED)
6. Bàn giao cho Developer Agent
```

### Test Naming Convention

```java
// Java (Spring Boot)
@Test
void should_ReturnTournamentList_When_ValidSearchRequest() { }
@Test
void should_ThrowException_When_InvalidPageSize() { }
```

```typescript
// TypeScript (React)
it('should render tournament list when data is loaded', () => { })
it('should show error message when API call fails', () => { })
```

### Tools & Skills
- `@skill:springboot-unit-test` — Spring Boot tests
- `@skill:reactjs-vitest` — React/Vite tests
- `Read`, `Write`, `Edit` — test files
- `Bash` — chạy test commands (`./gradlew test`, `pnpm vitest run`)

---

## 5. Database Agent

### Vai trò
Quản lý database schema, viết migration scripts, tối ưu queries, đảm bảo data integrity.

### Trách nhiệm

| # | Trách nhiệm | Chi tiết |
|---|-------------|----------|
| 1 | **Schema design** | Thiết kế bảng mới / thay đổi bảng theo spec từ BA Agent |
| 2 | **Migration scripts** | Viết SQL migration (rollback-able) |
| 3 | **Update docs** | Cập nhật `docs/database-schema.md` |
| 4 | **Query optimization** | Review jOOQ queries từ Developer Agent |
| 5 | **Data integrity** | Đảm bảo FK, UK, constraints, indexes |
| 6 | **Cross-ref** | Verify schema khớp với jOOQ generated classes |

### Conventions

```sql
-- Table naming: snake_case, prefix theo domain
-- cat_*    → Catalog/Master data (cat_facilities, cat_fields)
-- txn_*    → Transaction data (txn_bookings, txn)
-- user_*   → User domain (user_profile, user_rating)

-- Migration file naming:
-- V{version}__{description}.sql
-- Ví dụ: V20260313__add_tournament_bracket_type.sql

-- Bắt buộc:
-- Mọi ALTER TABLE phải có phần ROLLBACK comment
-- Mọi bảng mới phải có: created_at, updated_at, created_by, updated_by
```

### Schema hiện tại
- **69 tables + 1 view** — Chi tiết tại `docs/database-schema.md`
- **Extension:** PostGIS (tính khoảng cách geo)
- **jOOQ Generated:** `pickle-connect-be/gencode/generated-sources/jooq/`

### Tools
- MCP tool `posgresql-pickle-connect` — query trực tiếp DB (read-only)
- `Read`, `Write`, `Edit` — migration files, schema docs
- `Bash` — chạy `mvn generate-sources` (regenerate jOOQ)

---

## 6. Code Review Agent

### Vai trò
Review code từ Developer Agent trước khi bàn giao cho Quality & Security Agent. Focus vào code quality, conventions, và logic correctness.

### Trách nhiệm

| # | Trách nhiệm | Chi tiết |
|---|-------------|----------|
| 1 | **Convention check** | Naming, package structure, pattern compliance (CLAUDE.md) |
| 2 | **Logic review** | Business logic đúng theo spec |
| 3 | **DRY / SOLID** | Phát hiện code trùng lặp, vi phạm SOLID |
| 4 | **Error handling** | Exception handling đầy đủ, custom exceptions |
| 5 | **Performance** | N+1 queries, unnecessary DB calls, memory leaks |
| 6 | **API contract** | Request/Response match với OpenAPI spec |

### Review Checklist

```markdown
## Code Review Report — [Task ID]

### 1. Conventions
- [ ] Naming đúng PascalCase/camelCase theo CLAUDE.md
- [ ] Package structure đúng module pattern
- [ ] DTO tách Request/Response/Model

### 2. Logic & Correctness
- [ ] Business logic match với USER_STORIES.md
- [ ] Edge cases handled
- [ ] Null safety

### 3. Patterns
- [ ] Controller: @LogUserActivity, @CheckPermissions, @Valid
- [ ] Service: @RequiredArgsConstructor, try-catch với custom exception
- [ ] Repository: @ReadOnlyConnection cho read queries, jOOQ best practices
- [ ] FE: Custom hook pattern, service layer abstraction

### 4. Performance
- [ ] Không có N+1 queries
- [ ] Pagination đúng (pageNo - 1)
- [ ] Không fetch toàn bộ data không cần thiết

### 5. Dependencies
- [ ] Không thêm dependency mới chưa approve
- [ ] Import đúng javax/jakarta theo Boot version

### Verdict: APPROVE / REQUEST_CHANGES
**Comments:** [chi tiết]
```

### Tools
- `Read`, `Glob`, `Grep` — đọc và tìm code
- `Agent(Explore)` — khám phá context rộng hơn

---

## 7. Quality & Security Agent

### Vai trò
Gate cuối cùng trước khi task hoàn thành. Kiểm tra bảo mật (OWASP), chất lượng code, và TDD compliance.

### Trách nhiệm

| # | Trách nhiệm | Chi tiết |
|---|-------------|----------|
| 1 | **OWASP Top 10 scan** | SQL Injection, XSS, CSRF, Auth bypass, etc. |
| 2 | **TDD compliance** | Verify RED → GREEN → REFACTOR workflow đã thực hiện |
| 3 | **Test coverage** | Đảm bảo test cover đủ (happy + edge + error) |
| 4 | **Dependency audit** | Kiểm tra không có vulnerable dependencies |
| 5 | **Data exposure** | Không leak sensitive data (password, token, PII) trong response/log |
| 6 | **Input validation** | Mọi user input được validate (BE + FE) |

### Security Checklist

```markdown
## Security & Quality Report — [Task ID]

### OWASP Top 10
- [ ] **Injection:** Parameterized queries (jOOQ tự handle), no string concat SQL
- [ ] **Broken Auth:** Endpoint có @CheckPermissions, token validated
- [ ] **Sensitive Data:** Không log PII, response không chứa password/token
- [ ] **XXE:** Không parse XML từ user input
- [ ] **Broken Access Control:** Permission check đúng resource + scope
- [ ] **Misconfig:** Không hardcode credentials, dùng env variables
- [ ] **XSS:** FE sanitize user input, CSP headers
- [ ] **Insecure Deserialization:** Không deserialize untrusted data
- [ ] **Vulnerable Components:** Dependencies up-to-date
- [ ] **Logging:** Audit trail đầy đủ (@LogUserActivity)

### TDD Compliance
- [ ] Phase RED evidence (tests failed initially)
- [ ] Phase GREEN evidence (tests pass)
- [ ] Phase REFACTOR evidence (code cleaned, tests still pass)
- [ ] Zero-Bypass: Không có test skipped/ignored

### Quality Metrics
- [ ] All tests PASS
- [ ] No compiler warnings
- [ ] No TODO/FIXME left unresolved
- [ ] Documentation synced

### Verdict: APPROVED / REJECTED
**Reason:** [chi tiết]
**Required Actions:** [nếu REJECTED]
```

### Tools
- `Read`, `Glob`, `Grep` — scan code
- `Bash` — chạy test suites, check build
- `Agent(Explore)` — deep scan patterns

---

## Workflow Tổng Thể (End-to-End)

```
User Request
    │
    ▼
┌──────────────────┐
│  1. TEAM LEAD    │ ← Nhận yêu cầu, phân tích scope
│  (Orchestrator)  │
└────────┬─────────┘
         │
         ├──── Chạy SONG SONG ──────────────────────────────┐
         │                                                    │
         ▼                                                    ▼
┌──────────────────┐                              ┌──────────────────┐
│  2a. BA AGENT    │                              │  2b. DB AGENT    │
│  Confluence→Docs │                              │  Schema+Migration│
│  User Stories,   │                              │  Field Mapping   │
│  SRS, AC         │                              │  với nghiệp vụ   │
└────────┬─────────┘                              └────────┬─────────┘
         │                                                 │
         └──────────────────┬──────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   TEAM LEAD      │ ← Tổng hợp BA + DB deliverables
                  │   Tổng hợp       │
                  └────────┬─────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│  ⛔ USER REVIEW GATE (bắt buộc)                          │
│                                                          │
│  Team Lead trình TỔNG THỂ cho User:                      │
│  - Nghiệp vụ: User Stories, SRS, AC                     │
│  - Database: Schema, Field Mapping, Migration            │
│  - Cross-check: nghiệp vụ ↔ data model                  │
│                                                          │
│  ┌─────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │ APPROVE │   │ YÊU CẦU SỬA │   │ THAY ĐỔI LỚN    │  │
│  │    ↓    │   │      ↓       │   │       ↓          │  │
│  │ Tiếp    │   │ BA/DB sửa   │   │ BA+DB re-analyze │  │
│  │ tục ▼   │   │ → review lại │   │ từ đầu           │  │
│  └─────────┘   └──────────────┘   └──────────────────┘  │
│                                                          │
│  Max 5 vòng review. Vòng 3+ → escalate chi tiết hơn.    │
└────────┬─────────────────────────────────────────────────┘
         │ (chỉ khi User APPROVE)
         │
         ▼
┌──────────────────┐
│  3. TEST AGENT   │ ← TDD Phase RED: Viết tests, confirm FAIL
│  (RED phase)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  4. DEV AGENT(s) │ ← TDD Phase GREEN + REFACTOR: Implement + Clean
│  Java / ReactJS  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  5. REVIEW AGENT │ ← Code review: conventions, logic, performance
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  6. QA+SEC AGENT │ ← Final gate: security, TDD compliance, quality
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  TEAM LEAD       │ ← Checklist bàn giao → trả kết quả cho User
│  (Final review)  │
└──────────────────┘
```

---

## Quy Tắc Tương Tác Giữa Agents

### Communication Protocol

| Từ → Đến | Kênh | Nội dung |
|-----------|------|----------|
| Team Lead → Any Agent | TaskCreate + assign | Task description + context links |
| BA Agent → Team Lead | TaskUpdate + comment | Options khi spec mơ hồ |
| Team Lead → BA Agent | TaskUpdate | Quyết định phương án |
| **BA Agent → User** | **AskUserQuestion** | **Review deliverables nghiệp vụ (USER REVIEW GATE)** |
| **User → BA Agent** | **User response** | **APPROVE / Yêu cầu sửa / Thay đổi lớn** |
| **Team Lead → User** | **AskUserQuestion** | **Xác nhận trước khi tiến hành code (post-BA gate)** |
| Test Agent → Dev Agent | TaskUpdate | Test files path + RED confirmation |
| Dev Agent → Review Agent | TaskUpdate | Code files path + GREEN confirmation |
| Review Agent → QA Agent | TaskUpdate | Review report + APPROVE/CHANGES |
| QA Agent → Team Lead | TaskUpdate | Security report + APPROVED/REJECTED |

### Escalation Rules

```
1. Agent stuck > 3 vòng lặp → Báo Team Lead
2. Team Lead không quyết được → Hỏi User (AskUserQuestion)
3. Security vulnerability phát hiện → STOP ngay, báo Team Lead + User
4. Dependency mới cần thêm → STOP, cần User approve
5. Spec conflict giữa Confluence và /docs → BA Agent re-analyze
```

### Parallel Execution Rules

```
CÓ THỂ chạy song song:
- BA Agent + DB Agent (phân tích nghiệp vụ + thiết kế schema + map fields)
- Multiple Dev Agents (BE agent + FE agent)
- Code Review + docs update

KHÔNG được chạy song song (HARD GATES):
- ⛔ BA + DB phải CÙNG xong → Team Lead tổng hợp → USER REVIEW GATE
- ⛔ Chỉ sau khi User APPROVE tổng thể → mới được chạy Test/Dev/Review/QA
- Test Agent phải xong TRƯỚC Dev Agent (TDD RED → GREEN)
- Review Agent phải xong TRƯỚC QA Agent
- QA Agent phải xong TRƯỚC Team Lead sign-off
```

---

## Khởi Tạo Team — Quick Start

Khi user nói "tạo team" hoặc "start agent team", Team Lead thực hiện:

```
1. Đọc file này (.claude/rules/team-structure.md)
2. Đọc yêu cầu của user
3. Xác định agents cần thiết cho task:
   - Luôn có: Team Lead (self)
   - Tùy task: BA, DB, Test, Dev(s), Review, QA
4. Tạo TaskList với các task gán cho từng agent
5. Kick off theo workflow diagram ở trên
6. Monitor progress qua TaskList
7. Final checklist → bàn giao cho user
```

### Ví Dụ Khởi Tạo

**Task nhỏ (fix bug):**
```
Agents: Team Lead + Test Agent + 1 Dev Agent + QA Agent
Skip: BA Agent, DB Agent, Review Agent (optional)
```

**Task trung bình (thêm feature):**
```
Agents: Team Lead + BA Agent + Test Agent + 1 Dev Agent + Review Agent + QA Agent
Optional: DB Agent (nếu cần thay đổi schema)
```

**Task lớn (module mới):**
```
Agents: ALL 7 agents
Dev Agents: 2 (1 BE Java + 1 FE ReactJS)
```
