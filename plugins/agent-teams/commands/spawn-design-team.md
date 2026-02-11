---
name: spawn-design-team
description: Spawn a frontend design agent team with 3 modes — New Component, Page/Flow, Redesign — including discovery interview, user feedback gate, and pipeline context
argument-hint: <UI feature or design task>
---

# Spawn Frontend Design Team

Create an agent team for the design-to-implementation phase of frontend work, with four distinct perspectives maintaining creative tension: product requirements, visual design, technical implementation, and user advocacy. Includes a discovery interview for rich shared context, adaptive modes for different design tasks, and a user feedback gate before implementation begins.

## Prerequisites Check

Before spawning the team, verify:
1. Agent teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in settings.json env)
2. The user has provided a UI feature or design task via `$ARGUMENTS`

If agent teams are not enabled, show the user how to enable them:
```json
// Add to settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Step 1: Mode Selection

Present the mode table and ask the user which design mode fits their task. If the mode is obvious from `$ARGUMENTS`, confirm it rather than asking.

| # | Mode | When to Use |
|---|------|-------------|
| 1 | **New Component** | Creating a new reusable component from scratch — design system additions, shared UI elements |
| 2 | **Page / Flow** | Designing a full page or multi-step flow — onboarding, checkout, settings, dashboards |
| 3 | **Redesign** | Improving or reworking an existing UI — modernization, UX improvements, accessibility fixes |

**Auto-inference keywords:**
- Component, widget, button, input, card, modal, dialog, picker → **New Component**
- Page, flow, screen, wizard, onboarding, dashboard, settings, layout → **Page / Flow**
- Redesign, rework, improve, modernize, fix UX, accessibility audit → **Redesign**

## Step 2: Discovery Interview

Before spawning the team, conduct a structured interview to deeply understand the design task. The interview results become shared context for all teammates — this ensures the design is grounded in real requirements rather than assumptions.

**Adapt based on `$ARGUMENTS`** — skip questions the user has already answered in their initial prompt.

### Core Questions (ask up to 5, all modes)

| # | Question | Purpose |
|---|----------|---------|
| 1 | **Feature description** — "What should this UI feature do? Describe the user experience you envision." | Anchors the design — teammates need to know the intended experience |
| 2 | **Target users** — "Who will use this? What's their context (device, frequency, expertise level)?" | Shapes accessibility, responsive, and complexity decisions |
| 3 | **Design references** — "Are there existing designs, mockups, wireframes, or examples to follow?" | Grounds the Designer in concrete visual direction |
| 4 | **Design system** — "Does the project have a design system or component library? Which styling approach?" | Ensures consistency with existing patterns |
| 5 | **Quality bar** — "What matters most — pixel-perfect polish, accessibility compliance, shipping speed, or animation/delight?" | Shapes trade-off decisions during design and implementation |

### Extended Questions by Mode (ask 2 per mode)

#### New Component
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Component API** — "What props/configuration should this component accept? What variations are needed?" | Always — defines the component's flexibility |
| 7 | **Composition** — "Where will this component be used? What parent/child relationships should it support?" | When the component is part of a larger system |

#### Page / Flow
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Flow steps** — "What are the steps in this flow? What's the happy path and the error paths?" | Always — defines the page/flow structure |
| 7 | **Data requirements** — "What data does each step need? What APIs does this page call?" | When data-driven |

#### Redesign
| # | Question | When to Ask |
|---|----------|-------------|
| 6 | **Pain points** — "What's wrong with the current design? What specific problems are we solving?" | Always — focuses the redesign effort |
| 7 | **Constraints** — "What must stay the same? What can change? Any backwards-compatibility requirements?" | Always — prevents scope creep |

Present questions in batches of 3-5 using AskUserQuestion. Skip questions already answered in `$ARGUMENTS`.

## Step 3: Project Analysis

Before spawning, quickly analyze the project to identify:
- The component directory structure (e.g., `src/components/`, `app/`, `ui/`)
- The styling approach (e.g., Tailwind, CSS modules, styled-components, design tokens)
- Any existing design system or component library (e.g., shadcn/ui, Radix, custom)
- Test patterns for UI components (e.g., `*.test.*`, `*.spec.*`, testing library used)
- For Redesign mode: the existing implementation being redesigned

Include findings in the Design Context section of the spawn prompt.

**Pipeline context:** Feeds from `/spawn-planning-team` (UI requirements from phase briefs), `/spawn-brainstorming-team` (UI concept ideas); feeds into `/spawn-review-team` (design review of implementation), `/spawn-feature-team` (when the design needs backend work)

## Step 4: Spawn the Team

Compile the interview results into a `## Design Context` section and spawn the team. Replace all placeholders with actual content from the interview and project analysis.

**Spawn the following team (replacing placeholders with actual project details):**

```
Create an agent team called "design-[feature-slug]" to design and implement [UI FEATURE].

Spawn 4 teammates:

1. **Product Owner** — Define requirements and acceptance criteria for this UI feature.
   Write user stories with clear "given/when/then" scenarios. Set scope boundaries —
   what's in v1 vs future iterations. Prioritize features by user impact. Review all
   deliverables against acceptance criteria before approving.
   Use Sonnet model.

2. **Designer** — Create component specifications and interaction designs. Define visual
   hierarchy, layout structure, spacing, responsive breakpoints, and all interactive states
   (default, hover, focus, active, disabled, loading, error, empty). Specify design tokens
   and how the design maps to [STYLING_APPROACH]. Reference existing patterns in
   [COMPONENT_DIRS] to maintain design system consistency.
   Use Sonnet model.

3. **Frontend Dev** — Implement components based on Designer specs and Product Owner
   requirements. Work in [COMPONENT_DIRS]. Choose appropriate component architecture
   (composition, state management, data flow). Follow existing patterns in the codebase.
   Focus on performance (memoization, lazy loading, bundle impact). Write unit tests
   alongside implementation.

4. **User Advocate** — Review all specs and implementations for accessibility and usability.
   Verify WCAG 2.1 AA compliance: keyboard navigation, screen reader support, color contrast,
   focus management, ARIA attributes. Check responsive behavior, touch targets, error recovery,
   and edge cases (long text, empty states, slow connections). Review both the Designer's
   specs AND the Frontend Dev's implementation.
   Use Sonnet model.

Enable delegate mode — focus on coordination, not implementation.

## Design Context

[COMPILED INTERVIEW RESULTS — include all answers organized by section:]

### Feature Description
[What the UI feature does, intended user experience]

### Target Users
[Who uses this, context, device, expertise level]

### Design References
[Mockups, wireframes, examples — if any]

### Design System
[Component library, styling approach, design tokens]

### Quality Bar
[What matters most — polish vs accessibility vs speed vs delight]

### Additional Context
[Mode-specific extended question answers — component API, flow steps, pain points, etc.]

### Project Analysis
[Component directory structure, styling approach, existing design system, test patterns]

[IF REDESIGN MODE: ### Current Implementation]
[Findings from analyzing the existing UI being redesigned]

Create these tasks:
1. [Product Owner] Define user stories and acceptance criteria for [feature]
2. [Product Owner] Define scope boundaries — what's in v1 vs deferred
3. [Designer] Audit existing components and design patterns for reuse (blocked by task 1)
4. [User Advocate] Define accessibility requirements and testing criteria (blocked by task 1)
5. [Designer] Create component specs: layout, states, responsive breakpoints (blocked by tasks 2, 3)
6. [User Advocate] Review design specs for accessibility compliance (blocked by tasks 4, 5)
7. [Lead] USER FEEDBACK GATE — Present design specs and accessibility review to user. Ask user to: approve the design direction, request changes to specs, adjust scope, and confirm before implementation begins (blocked by task 6)
8. [Frontend Dev] Implement components following design specs (blocked by task 7)
9. [Frontend Dev] Implement interactive states and error handling (blocked by task 8)
10. [Designer] Visual review of implementation against specs (blocked by task 9)
11. [User Advocate] Accessibility review of implementation — keyboard, screen reader, contrast (blocked by task 9)
12. [Frontend Dev] Address feedback from Designer and User Advocate reviews (blocked by tasks 10, 11)
13. [Product Owner] Final acceptance review against user stories (blocked by task 12)
14. [Lead] Compile design artifacts — write deliverables to `docs/teams/[TEAM-NAME]/`: primary artifact (mode-specific: `component-spec.md`, `page-spec.md`, or `redesign-spec.md`) with frontmatter, task outputs to `tasks/`, team README with metadata, and update root index at `docs/teams/README.md` (blocked by task 13)

Important: The Designer and User Advocate provide specifications and review but do not
write implementation code. The Frontend Dev is the sole implementer to avoid conflicts.
Product Owner gates the start (requirements) and end (acceptance) of the process.
The user feedback gate after specs + accessibility review prevents expensive rework —
implementation is the costliest phase.

**Task Blocking Protocol -- ALL teammates MUST follow:**
- Before starting any task, call `TaskList` and verify the task's `blockedBy` list is empty
- NEVER begin work on a blocked task -- upstream tasks may produce outputs that change your requirements
- If all your assigned tasks are blocked, message the lead to report you are waiting, then go idle
- After completing a task, immediately call `TaskList` to check for newly unblocked tasks to claim
- When picking up a newly unblocked task, first read the deliverables/outputs from the tasks that were blocking it -- they contain context you need
```

**Output format (mode-specific):**
- **New Component:** Component spec + implementation + test suite + usage examples
- **Page / Flow:** Page spec + implementation + test suite + flow documentation
- **Redesign:** Before/after analysis + implementation + test suite + migration notes

All outputs feed into `/spawn-review-team` for design review, or `/spawn-feature-team` when backend work is needed.
**Artifact files:** `docs/teams/[TEAM-NAME]/[mode-specific].md` (primary), `tasks/` (task outputs)

## Output

After spawning, inform the user:
- The team has been created with 4 teammates (Product Owner, Designer, Frontend Dev, User Advocate)
- **Phase 1 (Requirements + Specs):** Product Owner defines requirements, Designer creates specs, User Advocate sets accessibility criteria
- **Phase 2 (Your Turn):** You'll review the design specs and accessibility assessment before implementation begins — this is the user feedback gate
- **Phase 3 (Implementation):** Frontend Dev implements based on approved specs
- **Phase 4 (Review):** Designer and User Advocate both review the implementation (visual fidelity + accessibility)
- **Phase 5 (Acceptance):** Product Owner does final acceptance against user stories
- Delegate mode keeps the lead focused on coordination
- 3 teammates use Sonnet for cost efficiency; Frontend Dev uses the default model for implementation quality
- The output feeds into `/spawn-review-team` for code review
- **Artifact files** are written to `docs/teams/[TEAM-NAME]/` — the primary deliverable, task outputs in `tasks/`, team README, and root index update at `docs/teams/README.md`
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
