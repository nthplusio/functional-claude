# Task 4: Dependency Grep Protocol for Risk Analyst Role (#18)

## Summary

Add a mandatory dependency grep step to the Risk Analyst role in `planning-blueprints.md` (Technical Spec mode). Before assessing risks, the Risk Analyst runs targeted file searches to identify which files, modules, or configs depend on the system/component being specified — preventing risk assessments that miss downstream breakage.

---

## File: `plugins/agent-teams/shared/planning-blueprints.md`

### Change 1: Extend the Risk Analyst role description in Mode 2 (Technical Spec)

**FIND (lines 130–135, Risk Analyst role description):**
```
3. **Risk Analyst** — Identify technical risks, failure modes, edge cases, and security
   implications (OWASP, auth, data protection, compliance). Assess likelihood and impact.
   Propose mitigations or design alternatives. Challenge optimistic assumptions about
   performance, scalability, and complexity.
   Use Sonnet model.
```

**REPLACE WITH:**
```
3. **Risk Analyst** — Before assessing risks, run a dependency grep: search the codebase for
   files that import, reference, or configure the component under spec (use Grep tool with the
   component name, key interfaces, and config keys as search terms). Include a "Dependency
   Surface" table in your task output listing affected files and their coupling type (import,
   config, test, docs). Then identify technical risks, failure modes, edge cases, and security
   implications (OWASP, auth, data protection, compliance). Assess likelihood and impact.
   Propose mitigations or design alternatives. Challenge optimistic assumptions about
   performance, scalability, and complexity.
   Use Sonnet model.
```

---

### Change 2: Update Risk Analyst task description in Mode 2 task list

**FIND (in Mode 2 task list, task 3):**
```
3. [Risk Analyst] Identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context)
```

**REPLACE WITH:**
```
3. [Risk Analyst] Run dependency grep on the component under spec, then identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context)
```

---

## Dependency Grep Protocol (embedded in role description)

The role description above is self-contained. For implementers reading the spec, the full behavior is:

### Step 1: Identify search terms
From the Planning Context `### Objective` and `### Current State`, extract:
- Primary component name (class, module, service, file)
- Key interfaces or exported symbols
- Config file keys or environment variable names

### Step 2: Run grep searches
```
Grep: component name across all files
Grep: key interface names
Grep: config/env key names
```

### Step 3: Produce Dependency Surface table

Output format (in task file):
```markdown
## Dependency Surface

| File | Coupling Type | Notes |
|------|--------------|-------|
| src/api/auth.ts | import | Imports AuthService directly |
| config/app.yaml | config | Sets AUTH_TIMEOUT key |
| tests/auth.test.ts | test | Unit tests for core auth flow |
```

Coupling types: `import`, `config`, `test`, `docs`, `indirect` (imported via re-export)

### Step 4: Risk assessment informed by dependency surface

Risk assessment proceeds as normal, but MUST include a section:
```markdown
## Downstream Risk: Dependency Surface Impact

For each high-impact file in the Dependency Surface, assess whether the proposed spec changes
would require updates to that file.
```

---

## Scope

This change applies to **Technical Spec mode only** (Mode 2 in `planning-blueprints.md`). Other modes that have a Risk Analyst role (Business Case mode) use a different risk framing (market/execution risk, not technical breakage) — do not apply to those.

**Risk Analyst role appears in:**
- Mode 2: Technical Spec — MODIFY (this spec)
- Mode 5: Business Case — do NOT modify (different risk domain)

---

## Conflict Analysis

- `planning-blueprints.md` Mode 2 Risk Analyst role description is modified by this spec only.
- The task number line for task 3 is also modified by spec #19 (adds `→ write to ...` suffix). These edits are to different parts of the same line: #18 changes the description text, #19 appends a path. Implementer should apply #18 first, then #19's path append.

**Edit order for task 3 line:**
1. Apply #18: change description text
2. Apply #19: append `— write to docs/teams/[TEAM-NAME]/tasks/03-technical-risks.md`

Final result:
```
3. [Risk Analyst] Run dependency grep on the component under spec, then identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context) — write to `docs/teams/[TEAM-NAME]/tasks/03-technical-risks.md`
```

---

## Version Impact

- `plugins/agent-teams/shared/planning-blueprints.md`: modified (Mode 2 only)
- Version bump: part of v0.18.0
