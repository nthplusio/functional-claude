---
name: spawn-design-team
description: Spawn a frontend design agent team with product, design, development, and UX perspectives
argument-hint: <UI feature or design task>
---

# Spawn Frontend Design Team

Create an agent team for the design-to-implementation phase of frontend work, with four distinct perspectives maintaining creative tension: product requirements, visual design, technical implementation, and user advocacy.

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

## Team Configuration

If `$ARGUMENTS` is provided, use it as the design task description. If not, ask the user what UI feature or design task they want to work on.

Before spawning, quickly analyze the project to identify:
- The component directory structure (e.g., `src/components/`, `app/`, `ui/`)
- The styling approach (e.g., Tailwind, CSS modules, styled-components, design tokens)
- Any existing design system or component library (e.g., shadcn/ui, Radix, custom)
- Test patterns for UI components (e.g., `*.test.*`, `*.spec.*`, testing library used)

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

Create these tasks:
1. [Product Owner] Define user stories and acceptance criteria for [feature]
2. [Product Owner] Define scope boundaries — what's in v1 vs deferred
3. [Designer] Audit existing components and design patterns for reuse (blocked by task 1)
4. [User Advocate] Define accessibility requirements and testing criteria (blocked by task 1)
5. [Designer] Create component specs: layout, states, responsive breakpoints (blocked by tasks 2, 3)
6. [User Advocate] Review design specs for accessibility compliance (blocked by tasks 4, 5)
7. [Frontend Dev] Implement components following design specs (blocked by tasks 5, 6)
8. [Frontend Dev] Implement interactive states and error handling (blocked by task 7)
9. [Designer] Visual review of implementation against specs (blocked by task 8)
10. [User Advocate] Accessibility review of implementation — keyboard, screen reader, contrast (blocked by task 8)
11. [Frontend Dev] Address feedback from Designer and User Advocate reviews (blocked by tasks 9, 10)
12. [Product Owner] Final acceptance review against user stories (blocked by task 11)

Important: The Designer and User Advocate provide specifications and review but do not
write implementation code. The Frontend Dev is the sole implementer to avoid conflicts.
Product Owner gates the start (requirements) and end (acceptance) of the process.
```

## Output

After spawning, inform the user:
- The team has been created with 4 teammates (Product Owner, Designer, Frontend Dev, User Advocate)
- Delegate mode keeps the lead focused on coordination
- The task flow is sequential by design: requirements → specs → implementation → review → fix → accept
- Designer and User Advocate both review the implementation (visual fidelity + accessibility)
- 3 teammates use Sonnet for cost efficiency; Frontend Dev uses the default model for implementation quality
- Use Shift+Up/Down to interact with individual teammates
- Use Ctrl+T to monitor the shared task list
