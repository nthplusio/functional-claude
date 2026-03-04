---
name: pm-setup
description: Guided setup wizard to register the current project with the project manager. Collects repo identity, GitHub username, Linear team, and writes the project profile to ~/.claude/project-manager/projects.json.
allowed-tools: Bash, Read, Write
---

# /pm-setup — Register a Project

Guided wizard to register the current repository as a managed project.

## Steps

### Step 1: Detect Current Repository

```bash
git remote get-url origin
```

Parse the output to extract `org/repo` (strip `.git` suffix, handle both SSH and HTTPS formats).

If this fails: "Not a git repository or no remote configured. Please run this from inside your project."

### Step 2: Check for Existing Profile

Read `~/.claude/project-manager/projects.json` if it exists. If this repo is already registered, ask:
> "This project is already registered as [name]. Do you want to update it?"

### Step 3: Collect Project Details

Ask the user for each piece of information in sequence:

**a) Display name**
> "What's the display name for this project? (e.g., 'My App', 'API Service')"

**b) GitHub username**
List available GitHub accounts:
```bash
gh auth status 2>&1 | grep "Logged in to github.com account"
```
> "Which GitHub account should be used for this project? (detected accounts shown above)"

Validate the chosen user:
```bash
gh auth switch --user <chosen_user> && gh api user --jq '.login'
```

**c) Linear team key**
> "What's the Linear team key for this project? (e.g., 'ENG', 'PLATFORM', 'APP')"

Validate by querying Linear MCP:
```
linear_get_teams
```
Find the team matching the key. If not found: "Team key not found in Linear. Available teams: [list]. Please check and re-enter."

**d) Linear project (optional)**
> "Is this work part of a specific Linear project? (optional — press Enter to skip)"

If the user provides a project name, validate it:
```
linear_list_projects with filter: { team: { key: { eq: <team_key> } } }
```
Match by name (case-insensitive). If not found: "Project not found. Available projects for this team: [list]. Enter a name, or press Enter to skip."

Store the project ID and name if provided. This can be updated later via `/pm-setup` (re-running on an existing project) or by editing `~/.claude/project-manager/projects.json` directly.

**e) Issue tracker confirmation**
Default is `linear`. Ask only if relevant:
> "Issue tracker: Linear (default). Is that correct?"

### Step 4: Write Project Profile

Load or initialize `~/.claude/project-manager/projects.json`:

```json
{
  "projects": {
    "<org/repo>": {
      "slug": "<repo-name>",
      "displayName": "<user input>",
      "gh_user": "<chosen github user>",
      "issue_tracker": "linear",
      "linear_team_key": "<team key>",
      "linear_team_id": "<team id from MCP validation>",
      "linear_project_id": "<project id if provided, or null>",
      "linear_project_name": "<project name if provided, or null>"
    }
  }
}
```

If the file already exists, merge the new project in — do not overwrite other projects.

Ensure the directory exists:
```bash
mkdir -p ~/.claude/project-manager
```

### Step 5: Create Cache Directory

```bash
mkdir -p ~/.claude/project-manager/cache/<slug>
```

### Step 6: Confirm Setup

Output a confirmation:
```
✓ Project registered: <displayName>
  Repo:         <org/repo>
  GitHub user:  <gh_user>
  Linear team:  <team_key> (<team_id>)
  Linear project: <project_name> (or "none — issues will be team-scoped")

Run /pm to get your first project briefing.
To update the project later, run /pm-setup again in this repo.
```
