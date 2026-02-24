# Planning Blueprint: Technical Spec

**Team:** Architect, API Designer, Risk Analyst
**Team name:** `plan-spec-[project-slug]`

```
Create an agent team called "plan-spec-[project-slug]" to write a technical specification for [OBJECTIVE].

Spawn [3-4] teammates:

1. **Architect** — Define high-level technical design: system boundaries, components, data flow,
   technology choices. Read existing architecture and codebase to ensure fit. Focus on structural
   "what" and "how". Also owns developer experience: codebase patterns, implementation clarity,
   and worked examples for implementers.
   Use Sonnet model.

2. **API Designer** — Design interfaces: API endpoints, request/response schemas, data models,
   state transitions, integration contracts. Single source of truth for all data models and
   schemas — other teammates reference by name, never redefine. Include error handling and
   edge cases. Verify all schemas and API examples against actual library documentation before finalizing.
   Use Sonnet model.

3. **Risk Analyst** — Before assessing risks, run a dependency grep: search the codebase for
   files that import, reference, or configure the component under spec (use Grep tool with the
   component name, key interfaces, and config keys as search terms). Include a "Dependency
   Surface" table in your task output listing affected files and their coupling type (import,
   config, test, docs). Then identify technical risks, failure modes, edge cases, and security
   implications (OWASP, auth, data protection, compliance). Assess likelihood and impact.
   Propose mitigations or design alternatives. Challenge optimistic assumptions about
   performance, scalability, and complexity.
   Use Sonnet model.

[IF DEVOPS ADVISOR SELECTED]
4. **DevOps Advisor** — Review deployment, infrastructure, and observability requirements.
   Flag spec decisions that create operational burden.
   Use Sonnet model.

Enable delegate mode — focus on coordination and user feedback. A designated teammate handles final document compilation.

## Planning Context

[Include Planning Context Template from ${CLAUDE_PLUGIN_ROOT}/shared/planning-blueprints/_context-template.md]

## Single Document Protocol

- API Designer is single source of truth for data models and schemas
- Other teammates reference models by name — never redefine
- Each teammate writes analysis to their task output file in `tasks/`
- API Designer compiles final `spec.md` with sections: Overview, System Architecture, API Contracts & Data Models, Risk & Security, Implementation Guide
- Before compiling, the compiler must verify all code snippets against actual library types — check method signatures, parameter names, return types, and schema syntax against the codebase's actual imports. Do not copy API usage from memory.

Effort budgets: codebase analysis tasks ~8-15 tool calls, writing tasks ~5-10 tool calls, coordination tasks ~3-5 tool calls.
Scale up if the task is larger than expected; scale down and flag if it's smaller.

Create these tasks:
1. [Architect] (~8-15 tool calls) Analyze existing system, define high-level design — components, boundaries, data flow, codebase patterns
2. [API Designer] (~8-15 tool calls) Draft API contracts, data models, and integration interfaces
3. [Risk Analyst] (~8-15 tool calls) Run dependency grep on the component under spec, then identify technical risks, security implications, and failure modes (NO blockers — start from Planning Context)
4. [Lead] (~3-5 tool calls) USER FEEDBACK GATE — Present design, contracts, and risks to user (blocked by 1, 2, 3)
5. [Architect] (~8-12 tool calls) Refine architecture, write implementation guide with examples (blocked by 4)
6. [API Designer] (~8-12 tool calls) Finalize contracts with error handling, edge cases, examples (blocked by 4)
7. [Risk Analyst] (~5-10 tool calls) Propose mitigations for accepted risks (blocked by 4)
8. [All] (~5-10 tool calls) Cross-review: validate spec coherence
9. [All] (~5-10 tool calls) Write domain sections — each teammate writes their named section: Architect → "System Architecture & Implementation Guide", API Designer → "API Contracts & Data Models", Risk Analyst → "Risk Assessment & Mitigations". Write ONLY your section; cross-reference others by name, do not duplicate. (blocked by task 8)
10. [API Designer] (~5-10 tool calls) Merge domain sections into spec.md — resolve cross-references, deduplicate, add overview — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact as `spec.md` with frontmatter, task outputs to `tasks/`, team README, and update root index at `docs/teams/README.md` (blocked by task 9)

The final spec should be detailed enough for implementation without further clarification.
Feeds into /spawn-build --mode feature.

[Include Output Standards variant and Shutdown Protocol from shared/output-standard.md and shared/shutdown-protocol.md]
```

**Artifact:** `spec.md` → feeds into `/spawn-build --mode feature`
