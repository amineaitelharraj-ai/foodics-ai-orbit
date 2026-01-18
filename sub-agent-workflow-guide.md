# Sub-Agent Workflow Best Practices

**Master-Worker pattern for large-scale code tasks with isolated contexts.**

---

## Overview

This guide describes a pattern for breaking down large coding tasks (refactoring, migrations, multi-file changes) into smaller, isolated sub-agent sessions coordinated by a master agent.

---

## Why This Approach

### Problem with Single-Context Tasks
- Large tasks (10+ files) cause **context bloat**
- Context compaction loses important details
- Quality degrades as context grows
- Errors compound without checkpoints

### Solution: Sequential Sub-Agents
- Each task runs in a **fresh, isolated context**
- Master agent coordinates and validates between tasks
- Version control commits act as **checkpoints** (recoverable progress)
- Sequential execution prioritizes accuracy over speed

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     MASTER AGENT (Main Context)                  │
│                                                                  │
│  1. Load plan + reference docs (coding standards, architecture) │
│  2. Create and manage task list                                  │
│  3. For each task:                                               │
│     a. Spawn sub-agent with RICH context                        │
│     b. Wait for completion + commit hash                        │
│     c. Run validation (tests, linting, deployment)              │
│     d. If PASS → next task. If FAIL → investigate/rollback      │
│  4. Run comprehensive tests                                      │
│  5. Generate final summary                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  SUB-AGENT #1   │  │  SUB-AGENT #2   │  │  SUB-AGENT #N   │
│  (Fresh Context)│  │  (Fresh Context)│  │  (Fresh Context)│
│                 │  │                 │  │                 │
│ • Read files    │  │ • Read files    │  │ • Read files    │
│ • Make changes  │  │ • Make changes  │  │ • Make changes  │
│ • Validate      │  │ • Validate      │  │ • Validate      │
│ • Commit        │  │ • Commit        │  │ • Commit        │
│ • Return result │  │ • Return result │  │ • Return result │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Sub-Agent Prompt Template

When spawning a sub-agent, provide **RICH CONTEXT** - not just "follow the docs":

```markdown
## Task: {TASK_TITLE}

### File(s) to Modify
- `{FILE_PATH_1}`
- `{FILE_PATH_2}` (if applicable)

### WHY This Task Matters
{Explain the problem and its impact on the system. Context helps the sub-agent make better decisions.}

### Architecture Context
{Provide relevant architecture details the sub-agent needs to know:}
- **Authentication**: {How auth works - JWT, sessions, API keys, etc.}
- **Data Layer**: {Database, ORM, caching patterns}
- **Error Handling**: {Project conventions for errors}
- **Logging**: {Structured logging format, log levels}
- **Key Dependencies**: {Important libraries/frameworks}

### Specific Changes Required
{List exact changes with line numbers when possible:}

1. **Line {N}**: `{old_pattern}` → `{new_pattern}`
2. **Line {M}**: {Description of change}
3. **Function `{name}`**: {What to modify}

### Code Standards
{Include relevant coding standards from your project:}

1. {Standard 1 - e.g., "No silent error swallowing"}
2. {Standard 2 - e.g., "Use structured logging"}
3. {Standard 3 - e.g., "Type hints required"}

### Example Transformation

**BEFORE** (problematic):
```{language}
{code_before}
```

**AFTER** (correct):
```{language}
{code_after}
```

### Validation Steps
1. Read the file(s) to understand current state
2. Make the specific changes listed above
3. Run syntax check: `{syntax_check_command}`
4. Run linter: `{lint_command}` (if applicable)
5. Run relevant tests: `{test_command}` (if applicable)
6. Commit with message format:
```
{type}({scope}): {short description}

- {Change 1}
- {Change 2}

{Optional: Co-author or ticket reference}
```

### Return Format
On success:
- Commit hash
- Summary of changes made

On failure:
- Error details
- What was attempted
- Suggested resolution
```

---

## Master Agent Responsibilities

### Phase 1: Initialization

```markdown
# Before starting any sub-agent work:

1. **Load Reference Documents**
   - Coding standards / style guide
   - Architecture documentation
   - Task plan or requirements

2. **Create Task List**
   - Break work into discrete, testable units
   - Order by dependencies (independent tasks first)
   - Estimate complexity for each task

3. **Establish Baseline**
   - Ensure all tests pass before starting
   - Note current commit hash as rollback point
   - Verify deployment/environment is working
```

### Phase 2: Task Execution Loop

```markdown
For each task in the list:

1. **Update Status**
   - Mark task as "in_progress"
   - Log start time

2. **Spawn Sub-Agent**
   - Provide RICH context (use template above)
   - Include relevant architecture details
   - Specify exact validation steps

3. **Process Sub-Agent Result**
   - Receive commit hash or error
   - If error: investigate, fix, or skip

4. **Validate Changes**
   - Run automated tests
   - Run linter/type checker
   - Deploy to test environment (if applicable)
   - Run smoke tests (if applicable)

5. **Decision Point**
   - PASS → Mark completed, proceed to next task
   - FAIL → Investigate, rollback if needed, retry or skip
```

### Phase 3: Completion

```markdown
After all tasks complete:

1. **Run Comprehensive Tests**
   - Full test suite
   - Integration tests
   - End-to-end tests (if applicable)

2. **Generate Summary Report**
   - Tasks completed vs skipped
   - Issues encountered
   - Test coverage results

3. **Cleanup**
   - Remove temporary files
   - Update documentation if needed
   - Create PR or merge to main branch
```

---

## Validation Patterns

### Automated Validation (Between Tasks)

```bash
# Syntax check (Python)
python3 -m py_compile {file}

# Syntax check (JavaScript/TypeScript)
npx tsc --noEmit

# Linting
{linter} {file}

# Unit tests for modified files
{test_runner} {test_file}

# Type checking
{type_checker} {file}
```

### Smoke Test Pattern (After Deployment)

```markdown
1. Navigate to application
2. Wait for ready state (connection, loading complete)
3. Perform basic operation
4. Verify expected response
5. Check for errors in console/logs
6. Close/cleanup
```

---

## Recovery Patterns

### If Sub-Agent Fails

```bash
# Check what went wrong
{view_error_logs}

# If commit was made but broken, revert
git revert HEAD --no-edit

# Or reset to previous commit
git reset --hard HEAD~1

# Or reset to specific checkpoint
git reset --hard {checkpoint_hash}
```

### If Validation Fails

```markdown
1. Check test output for specific failure
2. Check logs for errors
3. Determine root cause:
   - Code bug → Fix in next sub-agent or manual fix
   - Environment issue → Fix infrastructure
   - Flaky test → Retry validation
4. Decide: fix forward, rollback, or skip task
```

### If Deployment Fails

```bash
# Check deployment logs
{view_deployment_logs}

# Rollback to previous version
{rollback_command}

# Verify rollback succeeded
{health_check_command}
```

---

## Best Practices

### DO ✓

- **Provide WHY context** to sub-agents (not just "fix per standards")
- **Include architecture decisions** relevant to the task
- **Validate after EVERY task** (catch issues early)
- **Use commits as checkpoints** (recoverable progress)
- **Keep sub-agent scope narrow** (1-3 files max per session)
- **Order tasks by dependencies** (independent tasks first)
- **Document decisions** made during execution

### DON'T ✗

- **Parallelize sub-agents** (accuracy > speed for code changes)
- **Skip validation between tasks** (errors compound)
- **Assume sub-agent knows context** (always provide it)
- **Batch many files without commits** (harder to debug)
- **Ignore failing tests** (fix or understand before proceeding)
- **Rush through tasks** (quality matters more than speed)

---

## Task Breakdown Guidelines

### Good Task Scope

| Scope | Example | Why Good |
|-------|---------|----------|
| Single file refactor | "Update error handling in `auth.py`" | Focused, testable |
| Related functions | "Migrate logging in `utils/` module" | Cohesive changes |
| One feature area | "Add type hints to user service" | Clear boundary |

### Bad Task Scope

| Scope | Example | Why Bad |
|-------|---------|---------|
| Too broad | "Refactor entire codebase" | No clear completion |
| Too narrow | "Fix line 42" | Overhead not worth it |
| Mixed concerns | "Update auth AND add logging AND fix tests" | Too many failure modes |

### Dependency Ordering

```markdown
1. **Foundation changes first**
   - Shared utilities, base classes, types
   
2. **Core logic second**
   - Business logic, services
   
3. **Integration points third**
   - API endpoints, event handlers
   
4. **Tests last**
   - Update tests after code stabilizes
```

---

## Comprehensive Testing (Final Phase)

After ALL sub-agent tasks complete, run comprehensive validation:

### Test Matrix Template

| Category | Test Case | Expected Result | Status |
|----------|-----------|-----------------|--------|
| **Unit Tests** | | | |
| Core logic | All unit tests pass | Green | |
| Edge cases | Boundary conditions handled | Green | |
| **Integration Tests** | | | |
| API endpoints | All endpoints respond correctly | 200/expected | |
| Database operations | CRUD operations work | Success | |
| **End-to-End Tests** | | | |
| Happy path | Main user flow works | Complete | |
| Error handling | Errors shown appropriately | Graceful | |
| **Performance** | | | |
| Response time | Under threshold | < Xms | |
| Resource usage | Within limits | Normal | |

### Coverage Report Template

```markdown
## Test Coverage Report

**Date:** {DATE}
**Commits:** {FIRST_COMMIT}..{LAST_COMMIT}
**Environment:** {ENV_NAME}

### Results Summary

| Category | Passed | Failed | Skipped | Coverage |
|----------|--------|--------|---------|----------|
| Unit Tests | X/Y | | | Z% |
| Integration | X/Y | | | Z% |
| E2E | X/Y | | | Z% |
| **TOTAL** | **X/Y** | | | **Z%** |

### Tasks Completed
- [x] Task 1 - {commit_hash}
- [x] Task 2 - {commit_hash}
- [ ] Task 3 - SKIPPED: {reason}

### Issues Found
1. {Issue} - {Severity} - {Resolution}

### Recommendations
1. {Follow-up work needed}
```

---

## Metrics for Success

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Sub-agent success rate | > 90% | Tasks completed without retry |
| Validation pass rate | 100% | Tests pass before next task |
| Rollbacks required | < 10% | Reverts needed |
| Average task time | 5-15 min | Time per sub-agent session |
| Final test coverage | > 80% | Test suite coverage |

---

## Example Session Flow

```
Master: "Starting task 3 of 8: Update error handling in src/services/user.py"
Master: [Updates task status to in_progress]
Master: [Spawns sub-agent with rich context about error handling patterns]

Sub-Agent: [Reads file to understand current implementation]
Sub-Agent: [Identifies 4 places with silent error swallowing]
Sub-Agent: [Updates each to use proper error propagation]
Sub-Agent: [Runs syntax check - PASS]
Sub-Agent: [Runs linter - PASS]
Sub-Agent: [Commits: "fix(user-service): propagate errors instead of swallowing"]
Sub-Agent: "Done. Commit hash: abc1234. Changed 4 error handlers."

Master: [Runs unit tests for user service - PASS]
Master: [Runs integration tests - PASS]
Master: "Validation PASSED"
Master: [Updates task status to completed]
Master: [Proceeds to task 4]
```

---

## Adapting This Pattern

### For Different Project Types

| Project Type | Validation Focus | Special Considerations |
|--------------|------------------|------------------------|
| **Backend API** | Unit tests, integration tests, API contracts | Database migrations, backward compatibility |
| **Frontend** | Component tests, E2E, visual regression | Bundle size, accessibility |
| **Data Pipeline** | Data quality checks, idempotency | Backfill strategy, monitoring |
| **Infrastructure** | Plan/apply, drift detection | Rollback procedures, blast radius |
| **Mobile App** | Device testing, performance | App store guidelines, versioning |

### For Different Team Sizes

| Team Size | Coordination | Review Process |
|-----------|--------------|----------------|
| Solo | Self-review, automated checks | PR to main with full CI |
| Small (2-5) | Async updates, shared task list | Peer review before merge |
| Large (5+) | Stand-ups, task assignment | Multiple reviewers, staging env |

---

## Quick Reference

### Sub-Agent Prompt Checklist

- [ ] Task title and files to modify
- [ ] WHY this matters (context)
- [ ] Architecture details needed
- [ ] Specific changes with examples
- [ ] Relevant coding standards
- [ ] Validation steps
- [ ] Commit message format
- [ ] Expected return format

### Master Agent Checklist

- [ ] Reference docs loaded
- [ ] Task list created and ordered
- [ ] Baseline validated (tests pass)
- [ ] For each task: spawn → validate → checkpoint
- [ ] Comprehensive tests after completion
- [ ] Summary report generated

---

*This is a living document. Adapt the patterns to your project's needs.*
