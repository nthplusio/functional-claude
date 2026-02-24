---
task: 5
title: "Research best practices for LLM multi-agent prompting and coordination"
owner: researcher
team: review-agent-teams-plugin
date: 2026-02-23
---

# Best Practices Research: LLM Multi-Agent Prompting and Coordination

## Summary of Findings

The agent-teams plugin follows many established best practices but has structural issues that directly explain the known problems. The core tension is between **completeness** (protocols need all their content) and **compliance** (agents don't consistently follow long, middle-positioned instructions). Evidence-based solutions exist for all four known issues.

---

## 1. Protocol Compliance: Why Long Prompts Fail

### The "Lost in the Middle" Problem (Critical)

Research establishes that LLM performance degrades significantly when critical instructions appear in the **middle** of long contexts. Performance can drop by 30%+ when relevant information shifts from start/end positions to middle positions — even with long-context models.

**Plugin implication:** The current spawn prompt structure places protocol blocks *after* the task list and context:
```
[Context block]
[Task list]
[Task Blocking Protocol]  ← buried in middle
[Output Standards]
[Shutdown Protocol]
```

Critical behavioral rules (don't start blocked tasks, go idle silently, approve shutdowns immediately) are in the zone with highest degradation. This directly explains why agents violate protocols despite them being present.

**Best practice:** Put the most critical behavioral constraints at the **beginning** of the spawn prompt (before task list), not after. Reserve end position for the second-most-critical content.

### Instruction Volume and Compliance Rate

The AGENTIF benchmark found the average real-world agent instruction is ~1,717 tokens with ~11.9 constraints. The agent-teams spawn prompts are estimated at 2,000–4,000 tokens of protocol overhead *alone*, before task context. Research consistently shows compliance rates decrease as instruction count and length increase.

**Best practice:** Reduce total instruction count per spawn. Prioritize the 3-5 rules with highest failure cost. Cut or summarize the rest.

---

## 2. Multi-Agent Failure Taxonomy (MASFT)

Research (arxiv:2503.13657) identifies 14 failure modes across 3 categories. The plugin's known issues map directly:

| Known Issue | MASFT Failure Mode | Category |
|---|---|---|
| Agents start blocked tasks | FM-1.1: Disobey task specification | Specification/Design |
| Agents go idle, don't respond | FM-1.5: Unaware of termination conditions | Specification/Design |
| Agents send standing-by noise | FM-2.4: Information withholding (inverse) | Inter-Agent Misalignment |
| Agents don't approve shutdown | FM-3.1: Premature termination (inverse) | Task Verification |
| Context compaction data loss | FM-1.4: Loss of conversation history | Specification/Design |

**Key insight:** "No single error category disproportionately dominates" — failures are systemic. This supports fixing the structural/placement issues rather than just adding more rules.

---

## 3. Protocol Duplication: Structural Inefficiency

### Current Approach vs. Best Practices

The plugin embeds full protocol blocks in every spawn prompt at spawn time. Anthropic's official Claude Code documentation confirms that **teammates DO automatically load CLAUDE.md and skills** at spawn:

> "Each teammate loads the same project context as a regular session: CLAUDE.md, MCP servers, and skills."

This means universal behavioral rules that appear in CLAUDE.md or a loaded skill file do **not** need to be re-embedded in every spawn prompt. The current approach of duplicating all 4 protocol blocks in every spawn prompt wastes ~2,000 tokens per spawn.

**Best practice:** Move truly universal rules (idle behavior, shutdown approval, basic output formatting) to CLAUDE.md or a shared skill that auto-loads. Spawn prompts should only include task-specific constraints.

### Token Cost Evidence

Anthropic's own multi-agent research system found:
- "Token usage by itself explains 80% of the variance" in agent performance
- Multi-agent systems use ~15x more tokens than single chats
- Model selection improvements yield larger gains than doubling token budgets

Reducing per-spawn protocol overhead by 50% would have measurable positive impact on both cost and model attention allocation.

---

## 4. Agent Idle/Non-Response Problem

### Root Cause Analysis

Research identifies two distinct mechanisms causing agent silence:
1. **Missing termination logic** — agents never call "done" so peers keep waiting; a core open problem in MAS
2. **Misunderstood idle semantics** — the instruction "go idle silently" conflicts with Claude's default helpfulness behaviors

The current protocol says: "If all your assigned tasks are blocked, go idle silently — do NOT send 'standing by' or status messages."

This requires agents to understand what "idle" means operationally in the Claude Code context (stop taking turns, remain responsive to messages). The negative framing ("do NOT send") is less actionable than a positive behavioral description.

**Best practice:** The Claude Code docs confirm the system **automatically notifies the lead when a teammate goes idle**. The instruction should explain this mechanism so agents understand "going idle" is a supported system state, not something to fight against.

### Few-Shot Examples for Compliance

Anthropic's own guidance and research consistently show few-shot examples dramatically improve protocol compliance:
- Claude 3 Haiku: 11% compliance zero-shot → 75% compliance with 3 examples
- Claude 3 Sonnet: 16% → 52% with 3 semantically similar examples

**Best practice:** Add 1-2 concrete examples of correct idle/shutdown behavior directly in the protocol blocks:

```
CORRECT: TaskList shows all my tasks are blocked → call nothing, wait silently
WRONG: TaskList shows all my tasks are blocked → send "I'm standing by, waiting for unblocks"
```

---

## 5. Spawn Prompt Architecture Best Practices

### Orchestrator-Worker Pattern (Validated)

Anthropic's research and the MASS framework confirm the plugin's orchestrator-worker pattern is correct. Key validations:
- Lead decomposes tasks with clear objectives, output formats, and tool guidance ✓
- Teammates self-claim tasks rather than requiring lead assignment ✓
- Parallel execution with synchronization via task dependencies ✓

### Context Engineering vs. Prompt Engineering

The dominant 2025 paradigm shift: "Context engineering is replacing prompt engineering for production AI." The distinction:
- **Prompt engineering**: what you say in the prompt
- **Context engineering**: what information is in the context window, where it's positioned, and what auto-loads vs. is embedded

The plugin is stuck in prompt engineering mode — trying to solve compliance problems by adding more text. Context engineering would solve them by:
1. Auto-loading universal rules via CLAUDE.md/skills (removing from spawn)
2. Repositioning critical rules to prime attention positions
3. Using TaskUpdate as durable external memory instead of conversation context

### Effort Scaling Instructions

Research finds agents "struggle to judge appropriate effort for different tasks." The plugin's adaptive sizing (solo/pair/full) is good, but the spawn prompts don't give agents explicit effort budget guidance.

**Best practice (from Anthropic's multi-agent research):** Embed explicit effort guidelines: "simple queries: 3-10 tool calls; complex analysis: 20-50 tool calls." This prevents both over-engineering and premature stopping.

---

## 6. Information Architecture Best Practices

### Single Source of Truth

The plugin's own `output-standard.md` variant includes "Schemas, models, and contracts appear ONCE (owned by one teammate) — others reference by name." This is correct and should be generalized.

Research confirms a core multi-agent failure is **FM-2.4 (information withholding)** — agents not sharing findings with peers. The plugin's direct messaging design (share findings with specific peers) is the right mitigation.

### External Memory Pattern

Research shows the most token-efficient multi-agent design:
> "Subagents call tools to store their work in external systems, then pass lightweight references back to the coordinator"

The plugin already uses this pattern via task descriptions and output files. But the pattern should be more explicit: task descriptions are the durable state store; everything else is ephemeral.

---

## 7. Compliance Summary: What the Plugin Gets Right

| Practice | Status |
|---|---|
| Orchestrator-worker pattern | Correct |
| Adaptive team sizing | Correct |
| Task dependency system | Correct |
| External memory (task files) | Correct |
| Model tiering by phase | Correct |
| Direct peer messaging | Correct |
| Spec quality scoring before spawn | Correct, evidence-based |
| Discovery interviews for context | Correct |

---

## 8. Priority Fixes by Impact

### P1: Instruction Placement (High impact, low effort)

Move critical behavioral constraints to the **beginning** of spawn prompts (before task list). The "lost in the middle" effect is well-documented and directly explains compliance failures.

### P2: CLAUDE.md Auto-Loading for Universal Rules (High impact, medium effort)

Move idle behavior, shutdown approval, and output formatting rules to CLAUDE.md or a shared skill. Teammates auto-load these. Removes ~1,500 tokens from every spawn prompt and shifts instructions from "embedded in middle" to "auto-loaded at session start."

### P3: Add Few-Shot Compliance Examples (Medium impact, low effort)

Add 2-3 concrete correct/incorrect behavior examples to the task blocking and shutdown protocol blocks. Evidence shows 3-5x improvement in compliance for specific behaviors.

### P4: Clarify Idle Semantics with System Explanation (Medium impact, low effort)

Replace "go idle silently" with a positive description: "Stop taking turns and wait. The system automatically notifies the lead when you stop. You'll be woken when a new task unblocks or the lead messages you directly."

### P5: Effort Budgeting in Task Descriptions (Medium impact, medium effort)

Add tool-call budget hints to task descriptions (e.g., "This should take 10-20 tool calls"). Prevents both over-engineering and premature stopping.

---

## Sources

- [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172) — Stanford/MIT, positional bias in long context
- [Why Do Multi-Agent LLM Systems Fail? (MASFT)](https://arxiv.org/html/2503.13657v1) — 14-mode failure taxonomy
- [Building Effective Agents — Anthropic](https://www.anthropic.com/research/building-effective-agents) — orchestrator-worker patterns
- [How We Built Our Multi-Agent Research System — Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system) — token efficiency, effort scaling
- [Orchestrate Teams of Claude Code Sessions — Claude Code Docs](https://code.claude.com/docs/en/agent-teams) — auto-loading context, spawn prompt architecture
- [Multi-Agent Design: Optimizing Agents with Better Prompts and Topologies](https://arxiv.org/html/2502.02533v1) — prompt-optimized MAS outperforms scaling
- [Stop Wasting Your Tokens: Towards Efficient Runtime Multi-Agent Systems](https://arxiv.org/html/2510.26585v1) — 29.68% token reduction via observation purification
- [Multishot Prompting for Claude](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/multishot-prompting) — few-shot compliance improvements
- [AGENTIF: Benchmarking Instruction Following of LLMs in Agentic Scenarios](https://keg.cs.tsinghua.edu.cn/persons/xubin/papers/AgentIF.pdf) — instruction constraint benchmarks
- [A Guide to Improving Long Context Instruction Following — Scale AI](https://scale.com/blog/long-context-instruction-following) — task variety and fine-tuning for long context
