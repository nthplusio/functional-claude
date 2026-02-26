# Task 2: Output Filename Convention + Task Description Convention Spec (#19)

## Summary

Two conventions:
1. **Filename convention** — `output-standard.md` documents the existing `NN-[task-slug].md` pattern already established in `base-agent.md:52`, so the canonical reference is consolidated in one place.
2. **Task description embedding** — task descriptions in spawn prompts include the expected output filename, so teammates know exactly where to write without inferring.

**Note on existing pattern:** `base-agent.md:52` and `team-coordination/SKILL.md:449` already document `01-[task-slug].md` (zero-padded two-digit number, no "task-" prefix, hyphenated slug). This spec does NOT introduce a new convention — it documents the existing one in `output-standard.md` and embeds filenames in task description lines.

---

## File: `plugins/agent-teams/shared/output-standard.md`

### Change 1: Add filename convention section

**After the existing "## Protocol Block" section (after line 24), INSERT:**

```markdown
## Task Output Filename Convention

Task output files in `docs/teams/[TEAM-NAME]/tasks/` follow this naming pattern (established in `shared/base-agent.md`):

```
NN-[task-slug].md
```

Where:
- `NN` = zero-padded two-digit task number (e.g., `01`, `02`, `11`)
- `[task-slug]` = lowercase, hyphenated description of the task content (NOT the role name)

**Examples:**
- Task 1, Architect analyzing system design → `01-system-design.md`
- Task 3, Risk Analyst identifying risks → `03-technical-risks.md`
- Task 9, API Designer compiling spec → `09-api-spec-compilation.md`

**Compilation tasks** (final artifact assembly) use an artifact-descriptive slug:
- `11-roadmap-compilation.md`

**Exception:** USER FEEDBACK GATE tasks produce no file — they are interaction points, not written outputs.

### Rules for Lead

When writing task descriptions in the spawn prompt, include the expected output filename:

```
[Role] Task description — write output to `docs/teams/[TEAM-NAME]/tasks/NN-[task-slug].md`
```

This makes the filename explicit; teammates MUST NOT invent alternative names.
```

---

### Change 2: Update the Protocol Block to reference filename convention

**FIND (in the Protocol Block — appears in all 3 variants):**
```
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/` — keep each under 500 lines
```

**REPLACE WITH:**
```
- Task outputs go to `docs/teams/[TEAM-NAME]/tasks/NN-[task-slug].md` — keep each under 500 lines. Filename is specified in your task description.
```

Apply to all 3 variants: standard block, single-source-of-truth variant, and debug team variant.

---

## Files: All blueprint files in `plugins/agent-teams/commands/` and `plugins/agent-teams/shared/planning-blueprints.md`

### Change 3: Embed output filenames in task descriptions

For every task in every spawn prompt blueprint, append the expected output path to the task description line.

**Pattern to apply:**

```
N. [Role] Task description (blocked by ...) — write to `docs/teams/[TEAM-NAME]/tasks/NN-[task-slug].md`
```

**Example — Technical Spec mode (planning-blueprints.md, Mode 2):**

BEFORE:
```
1. [Architect] Analyze existing system, define high-level design — components, boundaries, data flow, codebase patterns
2. [API Designer] Draft API contracts, data models, and integration interfaces
3. [Risk Analyst] Identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context)
```

AFTER:
```
1. [Architect] Analyze existing system, define high-level design — components, boundaries, data flow, codebase patterns — write to `docs/teams/[TEAM-NAME]/tasks/01-system-design.md`
2. [API Designer] Draft API contracts, data models, and integration interfaces — write to `docs/teams/[TEAM-NAME]/tasks/02-api-contracts.md`
3. [Risk Analyst] Identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context) — write to `docs/teams/[TEAM-NAME]/tasks/03-technical-risks.md`
```

**Scope:** Apply to all numbered task lists in:
- `plugins/agent-teams/shared/planning-blueprints.md` — all 7 modes
- `plugins/agent-teams/commands/spawn-build.md` — all modes
- `plugins/agent-teams/commands/spawn-create.md` — all modes
- `plugins/agent-teams/commands/spawn-think.md` — all modes

**Exceptions (no file output):**
- USER FEEDBACK GATE tasks — no path appended
- Cross-review tasks (`[All]`) — no path appended (collaborative discussion, not a single file)
- Compilation tasks — use artifact name: `→ write primary artifact to docs/teams/[TEAM-NAME]/[artifact-name].md`

---

## Behavioral Summary

| Old behavior | New behavior |
|---|---|
| Teammates infer or invent output filenames | Filename specified in task description; pattern documented in output-standard.md |
| `output-standard.md` says directory only — no filename pattern | `output-standard.md` documents the `NN-[task-slug].md` pattern (consolidates with base-agent.md) |
| Inconsistent naming across runs | Deterministic, zero-padded, content-descriptive filenames |

---

## Conflict Note for Risk Analyst

Task descriptions in `planning-blueprints.md` will be modified by both this spec (#19) and potentially spec #18 (Risk Analyst dependency grep). The Risk Analyst task description line is modified by both:
- #18 adds role behavior to the Risk Analyst role description text
- #19 appends `→ write to ...` to the Risk Analyst task line

These are non-conflicting edits: #18 touches the **role description prose** inside the spawn prompt; #19 touches the **task number line** at the end. No overlap.

---

## Version Impact

- `plugins/agent-teams/shared/output-standard.md`: modified
- `plugins/agent-teams/shared/planning-blueprints.md`: modified (all 7 modes)
- `plugins/agent-teams/commands/spawn-build.md`: modified
- `plugins/agent-teams/commands/spawn-create.md`: modified
- `plugins/agent-teams/commands/spawn-think.md`: modified
- Version bump: part of v0.18.0
