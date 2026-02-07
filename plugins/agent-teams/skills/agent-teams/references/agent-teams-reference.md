# Agent Teams Complete Reference

Comprehensive reference for Claude Code agent teams: tools, architecture, configuration, and patterns.

## Enabling Agent Teams

Agent teams are experimental and disabled by default.

### Via settings.json

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Via Environment Variable

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

## Team Architecture

### Components

| Component | Role | Storage |
|-----------|------|---------|
| **Team Lead** | Main session; creates team, spawns teammates, coordinates | `~/.claude/teams/{team-name}/config.json` |
| **Teammates** | Independent Claude Code instances working on assigned tasks | Spawned as separate processes |
| **Task List** | Shared work items that teammates claim and complete | `~/.claude/tasks/{team-name}/` |
| **Mailbox** | Messaging system for inter-agent communication | Automatic delivery |

### Team Config File

Location: `~/.claude/teams/{team-name}/config.json`

Contains a `members` array with:
- `name`: Human-readable name (used for messaging and task assignment)
- `agentId`: Unique identifier
- `agentType`: Role/type of the agent

### Permissions

- All teammates start with the lead's permission settings
- If lead uses `--dangerously-skip-permissions`, all teammates do too
- Individual modes can be changed after spawning
- Cannot set per-teammate modes at spawn time

### Context

Each teammate:
- Has its own context window
- Loads CLAUDE.md, MCP servers, and skills from the project
- Receives the spawn prompt from the lead
- Does NOT inherit the lead's conversation history

## Core Tools

### TeamCreate

Creates a new team with shared task list.

```json
{
  "team_name": "my-project",
  "description": "Working on feature X"
}
```

Creates:
- Team file: `~/.claude/teams/{team-name}.json`
- Task directory: `~/.claude/tasks/{team-name}/`

### TaskCreate

Creates a task in the shared task list.

```json
{
  "subject": "Implement login API endpoint",
  "description": "Create POST /api/auth/login with JWT token response...",
  "activeForm": "Implementing login endpoint"
}
```

Fields:
- `subject`: Brief imperative title
- `description`: Detailed requirements and acceptance criteria
- `activeForm`: Present continuous form shown in spinner

### TaskUpdate

Updates task status, ownership, dependencies.

```json
{
  "taskId": "1",
  "status": "in_progress",
  "owner": "backend-dev"
}
```

Status progression: `pending` → `in_progress` → `completed` (or `deleted`)

Dependency management:
- `addBlocks`: Mark tasks that cannot start until this one completes
- `addBlockedBy`: Mark tasks that must complete before this one can start

### TaskList

Lists all tasks with status, owner, and dependency info.

### TaskGet

Retrieves full task details by ID.

### SendMessage

Sends messages between teammates.

#### Direct Message

```json
{
  "type": "message",
  "recipient": "researcher",
  "content": "Found a potential issue with the auth module",
  "summary": "Auth module issue found"
}
```

#### Broadcast (Use Sparingly)

```json
{
  "type": "broadcast",
  "content": "Critical: stop all work, breaking change discovered",
  "summary": "Critical breaking change found"
}
```

#### Shutdown Request

```json
{
  "type": "shutdown_request",
  "recipient": "researcher",
  "content": "Task complete, wrapping up"
}
```

#### Shutdown Response

```json
{
  "type": "shutdown_response",
  "request_id": "abc-123",
  "approve": true
}
```

#### Plan Approval Response

```json
{
  "type": "plan_approval_response",
  "request_id": "abc-123",
  "recipient": "researcher",
  "approve": true
}
```

### TeamDelete

Removes team and task directories. Fails if active teammates exist — shut them down first.

## Display Modes

| Mode | Setting | Requires |
|------|---------|----------|
| **In-process** | `"in-process"` | Nothing (default) |
| **Split panes** | `"tmux"` | tmux or iTerm2 |
| **Auto** | `"auto"` (default) | Uses split if already in tmux |

### In-Process Shortcuts

| Action | Shortcut |
|--------|----------|
| Select teammate | Shift+Up/Down |
| View teammate session | Enter |
| Interrupt teammate | Escape |
| Toggle task list | Ctrl+T |
| Cycle permission mode | Shift+Tab |

### Configuration

```json
// settings.json
{
  "teammateMode": "in-process"
}
```

```bash
# Per-session override
claude --teammate-mode in-process
```

## Hook Events for Teams

### TeammateIdle

Runs when a teammate is about to go idle.
- Exit code 0: Allow idle
- Exit code 2: Send feedback and keep working

### TaskCompleted

Runs when a task is being marked complete.
- Exit code 0: Allow completion
- Exit code 2: Prevent completion with feedback

## Task Coordination Patterns

### File Locking

Task claiming uses file locking to prevent race conditions when multiple teammates try to claim the same task.

### Dependency Chains

```
Task 1 (no deps) ──→ Task 2 (blocked by 1) ──→ Task 4 (blocked by 2,3)
                 ──→ Task 3 (blocked by 1) ──┘
```

Dependencies resolve automatically when blocking tasks complete.

### Recommended Task Count

5-6 tasks per teammate keeps everyone productive and lets the lead reassign if someone gets stuck.

## Teammate Spawning Patterns

### Basic Spawn

```
Spawn a teammate to handle the frontend implementation.
```

### With Model Selection

```
Create a team with 4 teammates. Use Sonnet for each teammate.
```

### With Plan Approval

```
Spawn an architect teammate. Require plan approval before changes.
```

### With Specific Context

```
Spawn a security reviewer with the prompt: "Review src/auth/ for
vulnerabilities. Focus on JWT handling. Report with severity ratings."
```

## Known Limitations

1. **No session resumption** for in-process teammates (`/resume` doesn't restore them)
2. **Task status can lag** — teammates may forget to mark tasks complete
3. **Shutdown can be slow** — teammates finish current work first
4. **One team per session** — clean up before starting a new team
5. **No nested teams** — teammates cannot spawn their own teams
6. **Lead is fixed** — cannot promote a teammate to lead
7. **Permissions set at spawn** — all teammates start with lead's mode
8. **Split panes** — not supported in VS Code terminal, Windows Terminal, or Ghostty

## Token Cost Considerations

Agent teams use significantly more tokens than a single session:
- Each teammate has its own context window
- Token usage scales with number of active teammates
- Research, review, and new feature work justify the extra tokens
- Routine tasks are more cost-effective with a single session

## Best Practices Summary

1. **Context:** Include task-specific details in spawn prompts (teammates don't get lead's history)
2. **Sizing:** Self-contained units producing clear deliverables (function, test file, review)
3. **File ownership:** Break work so each teammate owns different files
4. **Monitoring:** Check progress, redirect approaches, synthesize findings
5. **Start simple:** Begin with research/review before parallel implementation
6. **Delegate mode:** Use when lead keeps implementing instead of coordinating
7. **Dependencies:** Define blocking relationships to enforce task ordering
8. **Communication:** Default to direct messages; broadcast only for critical issues
