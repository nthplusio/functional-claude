---
task: 7
title: "Deep-dive on priority duplication areas with before/after examples"
owner: quality-reviewer
team: review-agent-teams-plugin
date: 2026-02-23
---

# Task 7: Before/After Rewrites for Priority Duplication

Breaking changes are acceptable. All rewrites optimize for token efficiency at spawn time and human readability for plugin authors.

---

## Finding 1: team-blueprints SKILL.md → Thin Router

### Problem

team-blueprints SKILL.md (807 lines) contains "representative spawn prompts" for all 8 blueprints. These are redundant with the actual commands. Every blueprint also ends with a "Configuration Tips" section that mostly restates what's already in the commands.

### What Stays vs What Goes

**Keep (unique to team-blueprints):**
- "When to use" / "Why teams work here" per blueprint (~4 lines each × 8 = ~32 lines)
- Mode tables with composition and output (e.g., Research Modes, Review Modes, Planning Modes) — these give users a quick overview
- Cross-Team Pipeline diagram (~35 lines) — not in commands
- "Choosing the Right Blueprint" decision tree (~25 lines) — not in commands
- "Customizing Blueprints" section (~20 lines)

**Cut (duplicated in commands or planning-blueprints.md):**
- All "Representative Spawn Prompt" sections (~250 lines across 8 blueprints)
- All "Configuration Tips" sections (~50 lines across 8 blueprints)
- Team composition tables that duplicate what's in spawn commands (~50 lines)
- "Task Blocking Protocol" section at the end (just points to shared/ file — already in commands)

**Estimated result:** 807 → ~400 lines

---

### Before: Blueprint 1 Research (lines 32–88, 57 lines)

```markdown
## Blueprint 1: Research & Discovery Team

**When to use:** Exploring a new technology, evaluating approaches, investigating a domain,
or gathering information from multiple angles before making decisions.

**Why teams work here:** Research benefits enormously from parallel exploration. A single
session gravitates toward one perspective; multiple teammates explore different facets
simultaneously and share findings.

**Advanced features:** 3 adaptive modes (Technology Evaluation, Landscape Survey, Risk
Assessment), discovery interview (5 core + 2 extended questions per mode), user feedback
gate after initial findings, optional teammates (Domain Expert, Implementer), pipeline
context for chaining with planning and feature teams.

### Research Modes

| # | Mode | Team Composition | Output |
|---|------|-----------------|--------|
| 1 | **Technology Evaluation** | Explorer, Analyst, Critic | Evaluation report → `/spawn-think --mode planning`, `/spawn-build --mode feature` |
| 2 | **Landscape Survey** | Explorer, Mapper, Analyst | Landscape map → `/spawn-think --mode research` (Eval mode), `/spawn-think --mode planning` |
| 3 | **Risk Assessment** | Risk Analyst, System Analyst, Mitigator | Risk register → `/spawn-think --mode planning`, `/spawn-build --mode feature` |

### Representative Spawn Prompt (Technology Evaluation)

[28-line spawn prompt block — full copy of what's in spawn-think.md]

### Configuration Tips

- The spawn command runs a **discovery interview** (5 core + 2 mode-specific questions) before spawning
- Mode is auto-inferred from keywords when obvious, confirmed rather than asked
- **Optional teammates** add depth: Domain Expert for specialized domains, Implementer for feasibility checking
- The **user feedback gate** after initial findings prevents deep-diving in directions the user doesn't care about
- Use Sonnet for all teammates (research is read-heavy)
- Include the Task Blocking Protocol in the spawn prompt (see "Task Blocking Protocol" section below)
```

### After: Blueprint 1 Research (~16 lines, -41 lines)

```markdown
## Blueprint 1: Research & Discovery Team

**When to use:** Exploring a new technology, evaluating approaches, or investigating a
domain before making decisions.

**Why teams work here:** Parallel exploration prevents single-perspective anchoring —
teammates explore different facets simultaneously and share findings.

**Command:** `/spawn-think --mode research` (runs discovery interview, adaptive sizing, auto-infers submode)

| # | Mode | Team Composition | Output → Pipeline |
|---|------|-----------------|--------|
| 1 | **Technology Evaluation** | Explorer, Analyst, Critic | `evaluation-report.md` → planning, feature |
| 2 | **Landscape Survey** | Explorer, Mapper, Analyst | `landscape-report.md` → research (eval), planning |
| 3 | **Risk Assessment** | Risk Analyst, System Analyst, Mitigator | `risk-assessment.md` → planning, feature |

**Optional teammates:** Domain Expert (specialized domains), Implementer (feasibility)
```

---

### Before: Blueprint 2 Feature (lines 90–145, 56 lines)

```markdown
## Blueprint 2: Feature Development Team

**When to use:** Building a new feature that spans multiple layers...

**Why teams work here:** Feature development benefits from teammates each owning a distinct piece...

**Advanced features:** Discovery interview (5 questions...), user feedback gate after API
contract definition, optional teammates (DevOps, Documentation)...

### Team Composition

| Teammate | Role | Focus |
|----------|------|-------|
| **Frontend** | UI/UX implementation | Components, pages, state management, styling |
| **Backend** | API & business logic | Endpoints, services, data access, validation |
| **Tester** | Test coverage & integration | Unit tests, integration tests, edge cases |
| **DevOps** (optional) | Infrastructure | Database migrations, CI/CD, environment config |
| **Documentation** (optional) | Docs | User-facing docs, API docs, changelog |

**Pipeline:** Feeds from planning, design, research → feeds into review

### Representative Spawn Prompt

[22-line spawn prompt block — full copy of what's in spawn-build.md]

### Configuration Tips

- The spawn command runs a **discovery interview** (5 questions) before spawning
- The **user feedback gate** after API contract is the key mechanism...
- Use delegate mode for the lead...
- **Optional teammates** add depth...
- Define clear file ownership boundaries...
- Include the Task Blocking Protocol...
```

### After: Blueprint 2 Feature (~15 lines, -41 lines)

```markdown
## Blueprint 2: Feature Development Team

**When to use:** Building features that span multiple layers (frontend, backend, data)
or require parallel implementation tracks.

**Why teams work here:** Cross-layer changes are naturally parallelizable when each
teammate owns their layer.

**Command:** `/spawn-build --mode feature` (discovery interview, API contract gate, adaptive sizing)

| Teammate | Role | Optional |
|----------|------|----------|
| **Frontend** | UI components, state management | — |
| **Backend** | API endpoints, services | — |
| **Tester** | Unit + integration tests | — |
| **DevOps** | Migrations, CI/CD, infrastructure | Yes |
| **Documentation** | API docs, user docs, changelog | Yes |

**Key mechanism:** User feedback gate after API contract — changing contracts post-implementation is expensive.
**Pipeline:** planning / design / research → **Feature** → review
```

---

### Before: "Task Blocking Protocol" section at bottom of team-blueprints (lines 633–638, 6 lines)

```markdown
## Task Blocking Protocol

Every spawn prompt must include the Task Blocking Protocol block. The canonical version
is defined in `${CLAUDE_PLUGIN_ROOT}/shared/task-blocking-protocol.md` — see that file
for the exact text, placement guidance, and rationale.

This is especially important for blueprints with deep dependency chains...
```

### After: Remove entirely

This section only points to the shared file. The commands already reference the shared file via reference directives. No information is lost.

---

## Finding 2: team-coordination SKILL.md → Strip Restated Content

### 2a. "Blocked Task Behavior" Section (lines 66–83, 18 lines → 4 lines)

#### Before

```markdown
### Blocked Task Behavior

Teammates **must** respect task blocking — starting a blocked task early leads to wasted
work because upstream tasks may produce outputs that change requirements, interfaces, or approach.

Every teammate should follow this protocol:

1. **Check before starting:** Call `TaskList` and verify the task's `blockedBy` list is empty before beginning work
2. **Never start blocked tasks:** Even if you think you know what to do — upstream tasks may change your requirements
3. **Go idle silently when blocked:** Do NOT send "standing by" or status messages — the system notifies the lead automatically
4. **Check after completing:** Immediately call `TaskList` after completing a task to find newly unblocked tasks to claim
5. **Read upstream outputs:** When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it — they contain context you need
6. **Respect user decisions:** When a USER FEEDBACK GATE was among your blocking tasks, treat all user decisions as binding constraints — do not include approaches, options, or paths the user explicitly rejected
7. **Shutdown compliance:** When you receive a shutdown_request, approve it immediately unless you are mid-write on a file

#### Including in Spawn Prompts

Since teammates don't inherit the lead's conversation or read skill files, the blocking
protocol must be embedded directly in every spawn prompt. The canonical protocol block is
defined in `${CLAUDE_PLUGIN_ROOT}/shared/task-blocking-protocol.md` — include it verbatim
in every spawn prompt. See that file for the exact text, placement guidance, and rationale.
```

#### After (4 lines)

```markdown
### Blocked Task Behavior

Teammates must respect task blocking — starting a blocked task wastes effort when upstream outputs change requirements. The canonical protocol block (including compaction resilience, shutdown compliance, and feedback gate rules) is in `${CLAUDE_PLUGIN_ROOT}/shared/task-blocking-protocol.md` — embed it verbatim in every spawn prompt.
```

**Savings: 14 lines, ~200 tokens**

---

### 2b. Duplicate Artifact Mapping Table (lines 515–535, 21 lines → 2 lines)

The identical table appears in team-blueprints SKILL.md lines 739–758. One copy must go.

Since team-coordination owns the Artifact Output Protocol (the more complete treatment), keep the table in team-coordination and remove it from team-blueprints.

#### Before (in team-blueprints SKILL.md lines 738–759)

```markdown
**Artifact mapping by team type:**

| Team Type | Dir Pattern | Primary Deliverable |
|-----------|------------|-------------------|
| Planning (Roadmap) | `plan-roadmap-{slug}` | `roadmap.md` |
| Planning (Spec) | `plan-spec-{slug}` | `spec.md` |
[... 13 more rows ...]
```

#### After (in team-blueprints SKILL.md)

```markdown
**Artifact mapping by team type:** See `team-coordination` skill → Artifact Output Protocol → Artifact Mapping by Team Type.
```

**Savings: 19 lines in team-blueprints. Table remains authoritative in team-coordination.**

---

### 2c. Discovery Interview Section (lines 274–346, 73 lines → 4 lines)

The team-coordination skill has a full "Discovery Interview Pattern" section re-explaining what the interview is, when to include it, the 5 core questions, adaptive skip logic, and output compilation. All of this is defined authoritatively in `shared/discovery-interview.md`.

The 5 core questions listed here ("Objective, Current state, Constraints, Stakeholders, Success definition") are **stale** — discovery-interview.md was updated to a 3-core-question format with dynamic follow-ups. This section now contradicts the canonical source.

#### Before (partial — lines 289–304)

```markdown
### Standard Structure

Every discovery interview has **Core Questions** (asked for all modes/uses) and **Extended Questions** (asked based on mode, category, or complexity):

```
Core Questions (up to 5, always asked):
1. Objective — What are we doing? What's the desired end state?
2. Current state — What exists today?
3. Constraints — What are the non-negotiables?
4. Stakeholders — Who decides, who's affected?
5. Success definition — How will we know this succeeded?

Extended Questions (2-5, mode-specific):
6-10. Questions that probe deeper into the specific mode or category
```

### Adaptive Behavior
[... more restatement ...]

### Output Compilation
[... more restatement ...]

### Canonical Implementations
[... more restatement ...]
```

#### After (replace entire "Discovery Interview Pattern" section, 73 lines → 5 lines)

```markdown
## Discovery Interview Pattern

A pre-spawn questioning phase that builds shared context for all teammates, allowing them to start working immediately rather than discovering constraints independently. Full specification in `${CLAUDE_PLUGIN_ROOT}/shared/discovery-interview.md`.

**Include when:** Context quality drives output quality (planning, research, design, brainstorm, feature teams).
**Skip when:** Input is already structured (debug bug description, review code diff, spec document).
```

**Savings: 68 lines, ~900 tokens**

---

### 2d. User Feedback Gate Section (lines 348–415) — Partial Trim

This section contains some unique content (the "How It Differs from Plan Approval" comparison table, the "Placement Guidance" by team type) alongside restatement. Keep the unique parts, cut the restatement.

**Keep:** "How It Differs from Plan Approval" table (7 lines), "Placement Guidance" table (10 lines)
**Cut:** "When to Include" table (12 lines — repeats what's in the commands), "Implementation" code block (14 lines — is a generic example, not needed when commands have the actual implementations), "Standard Phrasing" block (8 lines)

**Savings: ~34 lines**

---

## Finding 3: base-agent.md Cleanup

### 3a. Shutdown Compliance Section (lines 99–111, 13 lines → 5 lines)

#### Before

```markdown
## Shutdown Compliance

### Retrospective Questions

When you receive retrospective questions from the lead (typically 3 questions about goal
understanding, what went well, and what you'd change), answer concisely (2-3 sentences per
question). Focus on team process, not output quality. Be specific — name the coordination
pattern or friction point. This is your chance to influence how future teams operate.

### Shutdown Requests

When you receive a `shutdown_request`:
- Approve immediately unless you are mid-write on a file
- If mid-write, finish the write, then approve
- Do NOT reject to "finish up" analysis or messages — those can be resumed later
```

#### After

```markdown
## Shutdown Compliance

When asked retrospective questions (goal, what went well, what to change): answer in 2-3 sentences per question. Focus on team process and coordination patterns, not output quality.

Shutdown requests: approve immediately unless mid-write on a file (finish the write, then approve). Do NOT reject to "finish up" — work can resume later.
```

**Savings: 7 lines. Note:** The shutdown approval rule is now stated in 2 places (base-agent.md + shutdown-protocol.md Protocol Block). Since base-agent is read by plugin authors for context and is NOT embedded in spawn prompts, it's appropriate for it to have a human-readable summary. The protocol block in shutdown-protocol.md is the canonical rule for spawn-time embedding.

---

### 3b. Artifact Defaults Section (lines 41–91, 51 lines → reference)

base-agent.md contains a directory structure tree, frontmatter schemas, root index instructions, and a write/skip table. These are a **subset** of what's in team-coordination's "Artifact Output Protocol" (which has more complete schemas including the Team README frontmatter).

#### Before

```markdown
## Artifact Defaults

### Directory Structure

All team deliverables go to `docs/teams/[TEAM-NAME]/`:

```
docs/teams/[TEAM-NAME]/
├── README.md
├── [primary-artifact].md
└── tasks/
    ├── task-1-[role-slug].md
    └── ...
```

### Frontmatter

Every artifact file includes YAML frontmatter:

```yaml
# Primary deliverable
---
artifact: [artifact-name]
team: [team-name]
type: [team-type]
date: [YYYY-MM-DD]
---

# Task output
---
task: [task-number]
title: "[task-title]"
owner: [teammate-name]
team: [team-name]
date: [YYYY-MM-DD]
---
```

### Root Index

The designated compiler teammate updates `docs/teams/README.md` with a row for this team run.

### When to Write Artifacts

| Write | Skip |
|---|---|
| Analysis, reports, recommendations | Code implementation (the code IS the artifact) |
| Plans, roadmaps, strategies | Infrastructure or configuration tasks |
| Evaluation criteria and scoring | Tasks that only produce in-context messages |
```

#### After

```markdown
## Artifact Defaults

Team deliverables go to `docs/teams/[TEAM-NAME]/` with a primary artifact, `tasks/` subdirectory for task outputs, and a team README. Every artifact includes YAML frontmatter (`artifact`, `team`, `type`, `date` for primaries; `task`, `title`, `owner`, `team`, `date` for task outputs). The designated compiler updates the root index at `docs/teams/README.md`.

Write artifacts for analysis, reports, plans, and recommendations. Skip for code implementation, infrastructure tasks, and in-context-only outputs.

Full schemas and artifact mapping: `team-coordination` skill → Artifact Output Protocol.
```

**Savings: 44 lines. The full schemas remain authoritative in team-coordination.**

---

## Finding 4: Shutdown Approval Rule Consolidation

The rule "approve shutdown_request immediately unless mid-write on a file" appears in 3 locations:

| Location | Current Text | Action |
|---|---|---|
| `shared/shutdown-protocol.md` Protocol Block (line 119–126) | Full rule in the canonical embedded block | **KEEP — this is the authoritative spawn-time source** |
| `shared/task-blocking-protocol.md` Protocol Block (line 31) | "When you receive a shutdown_request, approve it immediately unless you are mid-write on a file" | **REMOVE** — this rule belongs to shutdown, not blocking. One fewer bullet in the blocking protocol block. |
| `shared/base-agent.md` Shutdown Compliance (lines 107–110) | Human-readable version | **KEEP as summary** (base-agent is for plugin authors, not spawn embedding) — but trim as shown in Finding 3a above |

### Before: task-blocking-protocol.md Protocol Block (excerpt, line 31)

```
- When you receive a shutdown_request, approve it immediately unless you are mid-write on a file
```

### After: Remove this bullet

The task-blocking-protocol block governs task sequencing behavior. Shutdown compliance is the shutdown-protocol's domain. Having shutdown rules in the blocking protocol creates maintenance risk (if the rule changes, it needs updating in both places).

**Savings: 1 bullet in the protocol block. Every spawn prompt gets a marginally shorter embedding.**

---

## Consolidated Savings Summary

| Change | Lines Saved | Token Impact |
|---|---|---|
| team-blueprints: Remove representative spawn prompts (8 blueprints) | ~250 | Skill read only (not spawn-time) |
| team-blueprints: Remove Configuration Tips sections | ~50 | Skill read only |
| team-blueprints: Replace artifact mapping table with cross-reference | ~19 | Skill read only |
| team-blueprints: Remove "Task Blocking Protocol" section | ~6 | Skill read only |
| team-coordination: Collapse "Blocked Task Behavior" to 1 paragraph | ~14 | Skill read only |
| team-coordination: Replace Discovery Interview section with summary | ~68 | Skill read only |
| team-coordination: Trim User Feedback Gate section | ~34 | Skill read only |
| base-agent: Collapse Shutdown Compliance | ~7 | Read at spawn via reference |
| base-agent: Replace Artifact Defaults with summary + cross-reference | ~44 | Read at spawn via reference |
| task-blocking-protocol: Remove shutdown bullet from protocol block | ~1 | **Every spawn prompt** |
| **Total** | **~493 lines** | |

**Net result:** team-blueprints 807→~480 lines, team-coordination 604→~490 lines, base-agent 110→~60 lines.

The only spawn-time token saving is the 1-bullet removal from the protocol block. All other savings are in skill files read on explicit invocation or during spawn setup.

---

## Recommended Priority Order

1. **team-coordination Discovery Interview section** (68 lines, stale content that actively contradicts discovery-interview.md — fix correctness AND reduce size)
2. **team-blueprints representative spawn prompts** (250 lines, pure duplication of commands)
3. **base-agent Artifact Defaults** (44 lines, subset of team-coordination)
4. **team-coordination User Feedback Gate trim** (34 lines)
5. **team-blueprints Configuration Tips** (50 lines)
6. **Remaining minor items** (artifact table dedup, shutdown bullet removal, base-agent shutdown trim)
