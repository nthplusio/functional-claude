# Resend Project Setup

Detailed procedures for project-level configuration and MCP server setup.

## First-Run Setup

When `.resend.md` does not exist in the project root, walk the user through setup. Ask these questions **one at a time**, confirming each answer before proceeding:

### Step 1: API Key Environment Variable

> What environment variable holds your Resend API key for this project? (e.g., `RESEND_API_KEY`, `RESEND_KEY_STAGING`)

Default to `RESEND_API_KEY` if the user has no preference. Verify the env var is set:

```bash
echo "${!VAR_NAME}"
```

If not set, ask for the key value and guide them to persist it (see MCP Server Setup § Check API Key below).

### Step 2: From Address

> What should the default sender name and address be? (e.g., `Claude <claude@nthplus.io>`)

### Step 3: Default Recipient

> What should the default recipient address be? (e.g., `scott@nthplus.io`)

This is used when the user doesn't specify a recipient. Can always be overridden per-email.

### Step 4: Sending Instructions (optional)

> Any default instructions for how emails should be composed? (e.g., tone, sign-off, CC rules, formatting)
>
> Leave blank for none.

Examples of useful instructions:
- "Keep emails concise and professional"
- "Always sign off with 'Best regards, Claude'"
- "CC manager@company.com on all external emails"
- "Use bullet points for action items"

### Step 5: Gitignore (before writing config)

**This step must happen before writing the config file.** Check if `.resend.md` is already covered by `.gitignore`:

```bash
git check-ignore .resend.md
```

If not ignored, append it to `.gitignore`:

```
# Resend project config (per-user, not committed)
.resend.md
```

Verify it's now ignored:

```bash
git check-ignore .resend.md
```

Do NOT proceed to write the config file until this check passes.

### Step 6: Write `.resend.md`

Write the config file to the project root:

```yaml
---
api_key_env: <env-var-name>
from: "<Name> <<address>>"
to: "<default-recipient>"
instructions: |
  <instructions, or remove this field if empty>
---

# Resend Configuration

Project-specific Resend email settings.
Managed by the resend-cli skill — edit directly or ask Claude to update.
```

### Step 7: Verify CLI or Set Up MCP Fallback

If the CLI is installed, setup is complete — proceed with the user's request.

If the CLI is not installed and the user declined to install it, set up MCP as a fallback — see MCP Server Setup below.

## MCP Server Setup (fallback — only when CLI is unavailable)

Only configure MCP when the Resend CLI is not installed and the user has declined to install it.

### Check Existing Configuration

Read `.mcp.json` at the project root. Look for a `resend` key under `mcpServers`.

If the entry already exists, MCP setup is complete — skip to the user's request.

### Check API Key

Read the `api_key_env` field from `.resend.md` to determine which env var this project uses, then check it:

```bash
echo "${!api_key_env}"
```

**If set**: Use `${<api_key_env>}` (env var reference) in the MCP config so the key resolves at runtime and isn't stored in the file.

**If not set**: Ask the user:

> What is your Resend API key? (starts with `re_`)
>
> You can find it at https://resend.com/api-keys

Then guide them to persist it using the project's env var name:

```bash
echo 'export <api_key_env>=re_xxxxx' >> ~/.bashrc && source ~/.bashrc
```

If the user prefers to store the key directly in `.mcp.json` instead of an env var, use the literal key value. Warn them that `.mcp.json` may be committed to version control.

### Write MCP Entry

Use the `api_key_env` value from `.resend.md` as both the env key name and the `${...}` reference.

**If `.mcp.json` does not exist**, create it:

```json
{
  "mcpServers": {
    "resend": {
      "command": "npx",
      "args": ["-y", "resend-mcp"],
      "env": {
        "RESEND_API_KEY": "${<api_key_env>}"
      }
    }
  }
}
```

For example, if `api_key_env: RESEND_KEY_STAGING`, the env block becomes `"RESEND_API_KEY": "${RESEND_KEY_STAGING}"`. The MCP server always reads `RESEND_API_KEY` internally — the `${...}` reference maps the project's env var to what the server expects.

**If `.mcp.json` already exists** (with other servers), read it, add the `resend` entry under `mcpServers`, and write the merged result. Do not overwrite existing server entries.

### Post-Setup Note

After adding the MCP entry, inform the user:

> Resend MCP server configured. You may need to restart your Claude session for the `mcp__resend__*` tools to become available.

## Updating Configuration

When the user asks to update, change, or reconfigure their Resend settings:

1. Read the current `.resend.md` frontmatter
2. Show the current values
3. Ask what they want to change (API key env var, from address, default recipient, instructions, or all)
4. Update only the changed fields in the frontmatter
5. Confirm the updated configuration

For MCP/API key changes, update the `.mcp.json` entry accordingly.
