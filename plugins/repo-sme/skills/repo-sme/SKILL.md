---
name: repo-sme
description: This skill should be used when the user asks to "ask the SME", "check the repo for", "query the SME", "consult the expert", "how does the API work", "look up in the SME", "what does this library do", "how does [library] handle", or when TypeScript errors reference external types from a registered repo. Use proactively when the user asks API questions about external libraries that match a registered SME repo.
version: 0.1.1
---

# Repository SME (Subject Matter Expert)

Query locally-cloned GitHub repositories for grounded, citation-backed answers about external library APIs.

**Do NOT announce registered repos at session start.** Do not list repos, mention how many are registered, or describe how to use the SME unprompted. Only act when a relevant API question arises.

## When to Spawn the SME Agent

Proactively spawn `repo-sme-expert` via the Task tool when **any** of these conditions are met:

1. User asks about types, methods, events, or interfaces of an external library
2. TypeScript compiler errors reference types from an external package
3. User imports match a registered repo name (e.g., `import { ... } from 'obsidian'`)
4. User asks "how does X work?" where X is a registered library's API

**Before spawning:** read `~/.claude/repo-sme/registry.json` to confirm a matching repo is registered.

## Registry Format

```json
{
  "repos": [
    {
      "name": "obsidian-api",
      "url": "https://github.com/obsidianmd/obsidian-api",
      "localPath": "/home/user/.claude/repo-sme/repos/obsidianmd/obsidian-api",
      "addedAt": "2026-02-28T10:00:00.000Z",
      "lastPulledAt": "2026-02-28T10:00:00.000Z"
    }
  ]
}
```

## How to Spawn the SME Agent

```
Use the Task tool:
  subagent_type: "repo-sme:repo-sme-expert"
  prompt: |
    Repository: <repoName>
    Path: <localPath>
    Question: <user's question>
```

Always pass `repoPath` and `repoName` so the agent knows where to search.

## Matching Library Names to Registered Repos

| Signal | Example | Action |
|--------|---------|--------|
| Import statement | `import { TFile } from 'obsidian'` | Check if `obsidian` or `obsidian-api` is registered |
| User question | "how does app.vault.read() work?" | Match `obsidian` → spawn SME |
| TS error | `error TS2305: Module 'obsidian' has no exported member 'X'` | Check registered repos for obsidian |
| Explicit request | "ask the SME about TFile" | Spawn directly |

## Commands Reference

| Command | Description |
|---------|-------------|
| `/repo-sme add <url>` | Clone and register a GitHub repo |
| `/repo-sme list` | Show all registered repos with status |
| `/repo-sme remove <name>` | Remove a repo from the registry |
| `/repo-sme ask <name> <question>` | Query a specific repo directly |

## Example Auto-Trigger Flow

User is working on an Obsidian plugin and asks:

> "How do I read file contents with the Vault API?"

1. Check registry — `obsidian-api` is registered at `/home/user/.claude/repo-sme/repos/obsidianmd/obsidian-api`
2. Spawn `repo-sme-expert` with: question="How do I read file contents with the Vault API?", repoPath=..., repoName="obsidian-api"
3. SME searches the clone, returns cited answer with file + line numbers
4. Present the grounded answer to the user

Never guess at API behavior — always use the SME for external library questions when a matching repo is registered.
