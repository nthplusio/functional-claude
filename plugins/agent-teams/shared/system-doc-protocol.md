# System Documentation Protocol

ADR (Architecture Decision Record) template and Documentation teammate instructions for feature team spawns. ADRs are produced by default for every feature spawn (`--skip-adr` to suppress).

## Why This Exists

Documentation is a strategic asset, not a chore. Without structured decision records, the rationale behind architectural choices lives only in the conversation that produced them — lost after the session ends. ADRs capture the *why* behind decisions: what was chosen, what was rejected, and what constraints drove the choice. Over time, `docs/decisions/` becomes a compounding knowledge base that planning teams reference to avoid relitigating settled decisions. Each ADR makes the next spawn richer — this is how autonomous teams accumulate institutional knowledge.

## ADR Template

Store ADRs at: `docs/decisions/[feature-slug]-adr.md`

```markdown
---
feature: [feature-slug]
team: feature-[feature-slug]
date: [YYYY-MM-DD]
status: accepted
---

# ADR: [Feature Name]

## Context

[What problem or requirement drove this decision? What constraints apply?]

## Decision

[What was decided? Be specific about the approach chosen.]

## Alternatives Considered

### [Alternative 1 Name]
- **Description:** [What this approach would look like]
- **Rejected because:** [Specific reason — constraint violation, trade-off, complexity]

### [Alternative 2 Name] (if applicable)
- **Description:** [What this approach would look like]
- **Rejected because:** [Specific reason]

## Constraints That Drove the Choice

- [Constraint 1 from discovery interview]
- [Constraint 2]

## Known Limitations

- [Limitation 1 — what this decision does NOT solve]
- [Trade-off accepted — what was sacrificed for what was gained]

## Edge Cases Addressed

[Reference edge cases from the refinement phase that influenced this decision]
```

## Documentation Teammate Instructions

When the Documentation teammate is included in a feature spawn, add this to their task description:

```
In addition to user-facing documentation, produce an Architecture Decision Record (ADR)
at `docs/decisions/[feature-slug]-adr.md`. The ADR captures the rationale behind
architectural choices — what was decided, what was rejected, and why.

Use the refinement phase output (edge cases, constraints) as ADR context. The ADR should
include at least 1 rejected alternative with a specific reason for rejection.

Create the `docs/decisions/` directory if it doesn't exist.
```

### When Documentation Teammate Is Not Selected

If the user did not select the Documentation optional teammate, the **lead** produces the ADR as part of the compilation task. Add to the compilation task description:

```
Also produce an ADR at `docs/decisions/[feature-slug]-adr.md` following the template
in `shared/system-doc-protocol.md`. Include at least 1 rejected alternative.
```

## Skip Flag

`--skip-adr` suppresses ADR generation. When this flag is present:
- Documentation teammate (if selected) skips ADR production
- Compilation task skips ADR production
- No `docs/decisions/` file is created

## Planning Team Integration

During project analysis for planning team spawns, scan `docs/decisions/` and report existing ADRs:

```
Architecture decisions: Found [N] ADRs in docs/decisions/
- [feature-slug-1]-adr.md (YYYY-MM-DD)
- [feature-slug-2]-adr.md (YYYY-MM-DD)
```

If `docs/decisions/` doesn't exist: `Architecture decisions: No existing ADRs found`

This gives planning teammates awareness of prior architectural choices, preventing relitigated decisions and surfacing constraints from earlier features.
