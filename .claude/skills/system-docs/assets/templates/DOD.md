# [Project Name] — Definition of Done

> **Version**: 1.0
> **Last Updated**: YYYY-MM-DD

## Definition of Done

A feature is considered **"Done"** when ALL of the following are satisfied:

### Code
- [ ] Code follows project coding standards and conventions
- [ ] Code reviewed and approved by at least 1 reviewer
- [ ] No critical or high-severity static analysis warnings
- [ ] All TODO/FIXME items resolved or tracked in backlog

### Testing
- [ ] Unit tests written and passing (≥80% coverage for new code)
- [ ] Integration tests written and passing for APIs
- [ ] Edge cases and error paths tested
- [ ] No regression in existing test suite

### Documentation
- [ ] API documentation updated (if API changed)
- [ ] `database-schema.md` updated (if schema changed)
- [ ] `SDD.md` updated (if design changed)
- [ ] User stories marked as completed in `USER_STORIES.md`
- [ ] `SPRINT.json` updated with current status

### Deployment
- [ ] Feature deployable to staging environment
- [ ] Database migrations tested and reversible
- [ ] Environment variables documented in `SDD.md`
- [ ] Rollback procedure verified

### Acceptance
- [ ] All acceptance criteria from user stories met
- [ ] Product owner / stakeholder sign-off received

---

**Related Documents**:
- [Master Backlog](MASTER_BACKLOG.md) — Feature tracking
- [SRS Master](SRS_MASTER.md) — Requirements traceability
