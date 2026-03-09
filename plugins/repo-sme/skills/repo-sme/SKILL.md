---
name: repo-sme
description: This skill should be used when the user asks to "ask the SME", "check the repo for", "query the SME", "consult the expert", "how does the API work", "look up in the SME", "what does this library do", "how does [library] handle", "repo architecture", "how does the repo work", "create an issue", "file an issue", "what branch has", or when TypeScript errors reference external types from a registered repo. Also use when the user asks about patterns, conventions, or architecture of a registered repository, or wants to compare branches.
version: 0.2.2
---

# Repository SME (Subject Matter Expert)

Query locally-cloned GitHub repositories for grounded, citation-backed answers about APIs, architecture, patterns, and conventions. Supports branch switching, cross-branch analysis, and GitHub issue creation.

**Do NOT announce registered repos at session start.** Only act when a relevant question arises.

## When to Spawn the SME Agent

Proactively spawn `repo-sme-expert` via the Agent tool when **any** of these conditions are met:

1. User asks about types, methods, events, or interfaces of an external library
2. TypeScript compiler errors reference types from an external package
3. User imports match a registered repo name (e.g., `import { ... } from 'obsidian'`)
4. User asks "how does X work?" where X is a registered library's API or architecture
5. User asks about patterns, conventions, or structure of a registered repository
6. User asks to create/file a GitHub issue against a registered repo
7. User asks about a specific branch of a registered repo

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
      "lastPulledAt": "2026-02-28T10:00:00.000Z",
      "currentBranch": "main",
      "defaultBranch": "main"
    }
  ]
}
```

## How to Spawn the SME Agent

```
Use the Agent tool:
  subagent_type: "repo-sme:repo-sme-expert"
  prompt: |
    Repository: <repoName>
    Path: <localPath>
    URL: <url>
    Branch: <currentBranch>
    Question: <user's question>
```

Always pass `localPath`, `repoName`, and `url`. Include `branch` when the user asks about a specific branch.

## Matching Library Names to Registered Repos

| Signal | Example | Action |
|--------|---------|--------|
| Import statement | `import { TFile } from 'obsidian'` | Check if `obsidian` or `obsidian-api` is registered |
| User question | "how does app.vault.read() work?" | Match `obsidian` → spawn SME |
| TS error | `error TS2305: Module 'obsidian' has no exported member 'X'` | Check registered repos for obsidian |
| Architecture question | "how does the plugin lifecycle work?" | Match to registered repo → spawn SME |
| Issue request | "file an issue about missing types" | Match to registered repo → spawn SME with issue context |
| Branch query | "what's on the develop branch?" | Match to registered repo → spawn SME with branch param |
| Explicit request | "ask the SME about TFile" | Spawn directly |

## Commands Reference

| Command | Description |
|---------|-------------|
| `/repo-sme add <url>` | Clone and register a GitHub repo |
| `/repo-sme list` | Show all registered repos with branch info |
| `/repo-sme remove <name>` | Remove a repo from the registry |
| `/repo-sme ask <name> <question>` | Query a specific repo directly |
| `/repo-sme branches <name>` | List all branches for a repo |
| `/repo-sme checkout <name> <branch>` | Switch a repo to a different branch |

Never guess at API behavior — always use the SME for external library questions when a matching repo is registered.
