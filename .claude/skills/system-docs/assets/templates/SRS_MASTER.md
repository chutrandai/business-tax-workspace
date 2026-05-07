# [Project Name] — Software Requirements Specification (Master)

> **Version**: 1.0
> **Last Updated**: YYYY-MM-DD

## 1. Introduction

### 1.1 Purpose
[Purpose of this SRS document]

### 1.2 Scope
[System scope and boundaries]

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|-----------|
| [Term] | [Definition] |

## 2. System Overview

[High-level description of the system, its context, and how it fits into the larger ecosystem]

## 3. Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001 | [System-wide functional requirement] | P0 | — |
| FR-002 | [System-wide functional requirement] | P0 | — |

> Feature-specific requirements are documented in each feature's `SRS_EXT.md`.

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target | Priority |
|----|------------|--------|----------|
| NFR-P01 | API response time (p95) | < 200ms | P0 |
| NFR-P02 | Page load time | < 2s | P0 |
| NFR-P03 | Concurrent users | [N] users | P1 |

### 4.2 Security

| ID | Requirement | Target | Priority |
|----|------------|--------|----------|
| NFR-S01 | Authentication method | [Method] | P0 |
| NFR-S02 | Data encryption at rest | AES-256 | P0 |

### 4.3 Scalability

| ID | Requirement | Target | Priority |
|----|------------|--------|----------|
| NFR-SC01 | Horizontal scaling | [Target] | P1 |

### 4.4 Availability

| ID | Requirement | Target | Priority |
|----|------------|--------|----------|
| NFR-A01 | Uptime SLA | 99.9% | P0 |

## 5. External Interfaces

### 5.1 User Interfaces
- [UI requirements and constraints]

### 5.2 Software Interfaces
- [Third-party integrations, APIs]

### 5.3 Hardware Interfaces
- [Hardware requirements if applicable]

## 6. Constraints

- [Technical constraints]
- [Regulatory constraints]
- [Business constraints]

## 7. Assumptions & Dependencies

### Assumptions
- [What we assume to be true]

### Dependencies
- [External dependencies]

---

**Related Documents**:
- [PRD](../PRD.md) — Product requirements
- [Architecture](../architecture.md) — System architecture
- [Database Schema](../database-schema.md) — Data model
- Feature SRS Extensions: `features/[feature-name]/SRS_EXT.md`
