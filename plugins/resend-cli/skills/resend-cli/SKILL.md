---
name: resend-cli
description: "Operate the Resend CLI and MCP server for sending emails, managing
  domains, contacts, broadcasts, templates, webhooks, API keys, and segments. Use
  when the user mentions Resend, wants to send email from the terminal, manage email
  infrastructure, work with Resend domains or contacts, create broadcasts, manage
  email templates, or any task involving the `resend` command or Resend MCP tools.
  Also trigger when the user says 'resend-send', 'send an email', 'email sending',
  'resend domains', 'resend contacts', 'resend broadcasts', 'resend templates',
  'configure resend', 'update resend config', 'resend setup', or references Resend
  operations. Manages per-project configuration (.resend.md) for domain, sender
  address, default recipient, API key env var, and sending instructions."
version: 0.3.0
---

# Resend CLI

## Project Setup (run on every activation)

On every activation, run through these checks in order before proceeding with the user's request. See [references/setup.md](references/setup.md) for detailed procedures.

### 1. Project Configuration (`.resend.md`)

Read `.resend.md` from the project root. If it exists, parse the YAML frontmatter:

```yaml
---
api_key_env: RESEND_API_KEY
from: "Claude <claude@nthplus.io>"
to: "scott@nthplus.io"
instructions: |
  Keep emails professional and concise.
  Sign off with "Best regards"
---
```

Fields:
- `api_key_env` — Name of the environment variable holding the Resend API key for this project (e.g., `RESEND_API_KEY`, `RESEND_KEY_STAGING`)
- `from` — Default sender in `"Name <address>"` format
- `to` — Default recipient address
- `instructions` — Behavioral guidelines for composing emails (tone, sign-off, formatting, CC rules, etc.)

**If `.resend.md` exists**, verify it is gitignored:

```bash
git check-ignore .resend.md
```

If not ignored, add it to `.gitignore` before proceeding. This file must never be committed.

**If `.resend.md` is missing**: Run first-time setup — see [references/setup.md](references/setup.md) § First-Run Setup.

**If the user asks to update/change config**: Read the current file, ask what to change, update the frontmatter, confirm. See [references/setup.md](references/setup.md) § Updating Configuration.

### 2. MCP Server (`.mcp.json`)

Check `.mcp.json` at the project root for a `resend` entry under `mcpServers`. If missing, set it up using the `api_key_env` from `.resend.md` — see [references/setup.md](references/setup.md) § MCP Server Setup.

When the MCP server is configured, `mcp__resend__*` tools are available for direct API access. Prefer MCP tools over the CLI for sending emails and managing resources.

**Note:** After adding the MCP server entry, the user may need to restart their Claude session for the tools to become available.

### 3. CLI Pre-flight (only when CLI is needed)

Only run these checks when an operation requires the CLI (webhook listening, diagnostics, auth management, or when MCP tools are unavailable):

```bash
~/.resend/bin/resend --version
```

If not found: `curl -fsSL https://resend.com/install.sh | bash`

## Sending Emails

Always apply project configuration when sending:

1. Use the `from` value from `.resend.md` as the default sender
2. Use the `to` value as the default recipient when the user doesn't specify one
3. Follow `instructions` from the config (tone, format, sign-off, etc.)
4. The user can override any default per-email

### Template-Aware Sending

Before composing any email, check for a matching template. After sending without a template, offer to create one. See [references/templates.md](references/templates.md) for the full workflow.

**Quick summary:**
1. **Pre-send**: List templates, match by name/alias against the email's purpose. If match found, offer to use it with `--template <id> --var key=value`.
2. **Send**: Compose and send using config defaults.
3. **Post-send**: If no template was used, offer to save the email as a reusable template.

### Via MCP (preferred)

Use `mcp__resend__*` tools when the MCP server is configured. Pass the `from` address from config.

### Via CLI (fallback)

```bash
~/.resend/bin/resend emails send \
  --from "<from-value-from-config>" \
  --to user@example.com \
  --subject "Subject" \
  --text "Body"
```

### Common Patterns

Send HTML email:
```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Update" --html "<h1>Hello</h1>"
```

Send with attachments:
```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Files" --text "See attached" --attachment ./doc.pdf
```

Pipe HTML from file:
```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Newsletter" --html-file ./newsletter.html
```

Send using a template:
```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --template tmpl_abc123 --var name=Alice
```

Batch send from JSON:
```bash
~/.resend/bin/resend emails batch --file batch.json
```

Schedule for later:
```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Reminder" --text "..." --scheduled-at "2025-03-01T09:00:00Z"
```

## Quick Reference

| Task | Command |
|------|---------|
| Send email | `resend emails send --from ... --to ... --subject ... --text/--html ...` |
| List sent emails | `resend emails list` |
| Batch send | `resend emails batch --file emails.json` |
| Cancel scheduled | `resend emails cancel <id>` |
| List domains | `resend domains list` |
| Verify domain | `resend domains verify <id>` |
| List contacts | `resend contacts list` |
| Create broadcast | `resend broadcasts create --from ... --subject ... --segment-id ... --html ...` |
| Send broadcast | `resend broadcasts send <id>` |
| List templates | `resend templates list` |
| Create webhook | `resend webhooks create --endpoint https://... --events all` |
| Listen webhooks | `resend webhooks listen --url <tunnel-url>` |
| Check auth | `resend whoami` |
| Diagnostics | `resend doctor` |

## Global Flags

- `--api-key <key>` — Override API key
- `-p, --profile <name>` — Use specific profile
- `--json` — Force JSON output
- `-q, --quiet` — Suppress spinners, implies `--json`

## Output Behavior

- **Interactive** (TTY): Formatted text + spinners on stderr
- **Machine** (piped/CI/`--json`): JSON on stdout, nothing on stderr
- Errors: `{"error":{"message":"...","code":"..."}}` + exit code `1`

## Command Reference

For complete flags and options, see [references/commands.md](references/commands.md).

Command groups: emails, domains, api-keys, broadcasts, templates, contacts, contact-properties, segments, topics, webhooks, auth.
