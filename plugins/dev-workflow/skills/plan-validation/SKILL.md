---
name: plan-validation
description: |
  This skill should be used when the user is creating an implementation plan, entering plan mode, or designing an approach for a feature. Use this skill when the user asks to "create a plan", "plan the implementation", "design an approach", "enter plan mode", or says "let's plan this out".

  This skill provides a validation checklist that should be incorporated INTO the plan as it's being written, ensuring plans are complete before they're even finished.
version: 0.2.1
---

# Plan Validation Checklist

When creating implementation plans, incorporate this checklist to ensure plans are complete and well-considered. Address each section as you write the plan, not as a separate validation step.

## Required Plan Sections

### 1. Problem Statement
- What specific problem are we solving?
- What evidence exists that this problem is real? (user complaints, metrics, research)
- Are we solving the root cause or just symptoms?

### 2. Success Criteria
- How will we know this worked?
- What are the measurable outcomes?
- Who determines success?

### 3. Scope Definition
- What is IN scope?
- What is explicitly OUT of scope?
- What is the minimum viable version?
- Can this be shipped incrementally?

### 4. Technical Approach
- What is the high-level approach?
- How does this integrate with existing code patterns?
- What are the key technical decisions?
- What are we most uncertain about?

### 5. Files to Modify/Create
- List specific files with their purpose
- Note which are new vs modified
- Identify any files that need research first

### 6. Implementation Sequence
- What order should changes be made?
- What are the critical path dependencies?
- What are the risky parts to tackle first?

### 7. Risk Assessment
- What could go wrong?
- What's the rollback plan?
- Are there security, performance, or reliability concerns?

### 8. Verification Plan
- How will changes be tested?
- What edge cases need consideration?
- How will we verify success criteria are met?

## Plan Quality Signals

**Good plans have:**
- Clear problem statement with evidence
- Defined, measurable success criteria
- Appropriate scope (not too broad)
- Identified risks and mitigations
- Logical implementation sequence
- Consideration of existing codebase patterns

**Red flags in plans:**
- Vague problem statements ("improve performance")
- No success metrics
- Scope creep built in ("while we're at it...")
- Assumptions stated as facts
- Missing error/edge case handling
- Ignoring existing patterns in the codebase

## Before Finalizing

Ask yourself:
1. Does this plan actually solve the stated problem?
2. Is the scope appropriate for the problem size?
3. Are the technical assumptions validated?
4. What's the simplest version that could work?

If any section is incomplete or uncertain, note it explicitly in the plan rather than glossing over it.
