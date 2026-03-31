# Resend Project Setup

Detailed procedures for project-level configuration and MCP server setup.

## First-Run Setup

When `.resend.md` does not exist in the project root, walk the user through setup. Ask these questions **one at a time**, confirming each answer before proceeding:

### Step 1: Domain

> What domain will you send emails from? (e.g., `nthplus.io`)

### Step 2: From Address

> What should the default sender name and address be? (e.g., `Claude <claude@nthplus.io>`)

Suggest `<Name> <<user-input>@<domain-from-step-1>>` based on context.

### Step 3: Sending Instructions (optional)

> Any default instructions for how emails should be composed? (e.g., tone, sign-off, CC rules, formatting)
>
> Leave blank for none.

Examples of useful instructions:
- "Keep emails concise and professional"
- "Always sign off with 'Best regards, Claude'"
- "CC manager@company.com on all external emails"
- "Use bullet points for action items"

### Step 4: Write `.resend.md`

Write the config file to the project root:

```yaml
---
domain: <domain>
from: "<Name> <<address>>"
instructions: |
  <instructions, or remove this field if empty>
---

# Resend Configuration

Project-specific Resend email settings.
Managed by the resend-cli skill — edit directly or ask Claude to update.
```

### Step 5: Gitignore

Check if `.resend.md` is already covered by `.gitignore`. If not, append it:

```
# Resend project config
.resend.md
```

This prevents accidental commits of project-specific sending preferences.

### Step 6: Continue to MCP Server Setup

After writing the config, proceed to MCP Server Setup below.

## MCP Server Setup

### Check Existing Configuration

Read `.mcp.json` at the project root. Look for a `resend` key under `mcpServers`.

If the entry already exists, MCP setup is complete — skip to the user's request.

### Check API Key

```bash
echo "$RESEND_API_KEY"
```

**If set**: Use `${RESEND_API_KEY}` (env var reference) in the MCP config so the key resolves at runtime and isn't stored in the file.

**If not set**: Ask the user:

> What is your Resend API key? (starts with `re_`)
>
> You can find it at https://resend.com/api-keys

Then guide them to persist it:

```bash
echo 'export RESEND_API_KEY=re_xxxxx' >> ~/.bashrc && source ~/.bashrc
```

If the user prefers to store the key directly in `.mcp.json` instead of an env var, use the literal key value. Warn them that `.mcp.json` may be committed to version control.

### Write MCP Entry

**If `.mcp.json` does not exist**, create it:

```json
{
  "mcpServers": {
    "resend": {
      "command": "npx",
      "args": ["-y", "resend-mcp"],
      "env": {
        "RESEND_API_KEY": "${RESEND_API_KEY}"
      }
    }
  }
}
```

**If `.mcp.json` already exists** (with other servers), read it, add the `resend` entry under `mcpServers`, and write the merged result. Do not overwrite existing server entries.

### Post-Setup Note

After adding the MCP entry, inform the user:

> Resend MCP server configured. You may need to restart your Claude session for the `mcp__resend__*` tools to become available.

## Updating Configuration

When the user asks to update, change, or reconfigure their Resend settings:

1. Read the current `.resend.md` frontmatter
2. Show the current values
3. Ask what they want to change (domain, from address, instructions, or all)
4. Update only the changed fields in the frontmatter
5. Confirm the updated configuration

For MCP/API key changes, update the `.mcp.json` entry accordingly.
