---
name: resend-cli
description: "Operate the Resend CLI for sending emails, managing domains, contacts, broadcasts, templates, webhooks, API keys, and segments. Use when the user mentions Resend, wants to send email from the terminal, manage email infrastructure, work with Resend domains or contacts, create broadcasts, manage email templates, or any task involving the `resend` command. Also trigger when the user says 'resend-send', 'send an email', 'email sending', 'resend domains', 'resend contacts', 'resend broadcasts', 'resend templates', or references Resend CLI operations."
version: 0.1.0
---

# Resend CLI

## Pre-flight Checks

Before running any resend command, perform these checks:

### 1. Verify the CLI is installed

```bash
~/.resend/bin/resend --version
```

If not found, install with: `curl -fsSL https://resend.com/install.sh | bash`

### 2. Check for API key

```bash
echo "$RESEND_API_KEY"
```

The `RESEND_API_KEY` env var is the primary auth method. If empty, check:
- `~/.bashrc` for `export RESEND_API_KEY=...` (may need `source ~/.bashrc` to load)
- `~/.config/resend/credentials.json` for stored profiles via `resend login`
- If neither exists, ask the user for their Resend API key before proceeding

### 3. Check for the sender alias

```bash
grep 'resend-send' ~/.bashrc
```

The user may have a `resend-send` alias in `.bashrc` that pre-fills `--from`. If it exists, use the alias to avoid repeating the sender address. If not, always provide `--from` explicitly. Note: shell aliases are not available in non-interactive bash. Always use the full expanded command when running via Bash tool:

```bash
~/.resend/bin/resend emails send --from "Claude <claude@resend.nthplus.io>" --to ...
```

Parse the alias to extract the `--from` value and the binary path rather than relying on the alias itself.

## Environment

- Binary: `~/.resend/bin/resend`
- Auth: `RESEND_API_KEY` env var (typically set in `.bashrc`)
- Config: `~/.config/resend/credentials.json`
- Auth priority: `--api-key` flag > `RESEND_API_KEY` env var > stored credentials

## Quick Start

After pre-flight checks, use the full binary path and `--from` value discovered from the alias or provided by the user.

Send a plain text email:

```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Hello" --text "Message body"
```

Send HTML email:

```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Update" --html "<h1>Hello</h1><p>Content</p>"
```

Send HTML from file:

```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Report" --html-file ./report.html
```

Send with attachments:

```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Files" --text "See attached" --attachment ./doc.pdf ./data.csv
```

Send to multiple recipients with CC/BCC:

```bash
~/.resend/bin/resend emails send --from "<FROM>" --to a@example.com b@example.com --cc c@example.com --bcc d@example.com --subject "Team" --text "Hi all"
```

Schedule for later (ISO 8601 or natural language):

```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Reminder" --text "Don't forget" --scheduled-at "2025-03-01T09:00:00Z"
```

Send using a template:

```bash
~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --template tmpl_abc123 --var name=Alice --var plan=Pro
```

## Key Commands

| Task | Command |
|------|---------|
| Send email | `resend emails send --from ... --to ... --subject ... --text/--html ...` |
| List sent emails | `resend emails list` |
| Get email details | `resend emails get <id>` |
| Batch send (up to 100) | `resend emails batch --file emails.json` |
| Cancel scheduled | `resend emails cancel <id>` |
| List domains | `resend domains list` |
| Verify domain DNS | `resend domains verify <id>` |
| List contacts | `resend contacts list` |
| Create contact | `resend contacts create --email user@example.com` |
| Create broadcast | `resend broadcasts create --from ... --subject ... --segment-id ... --html ...` |
| Send broadcast | `resend broadcasts send <id>` |
| List templates | `resend templates list` |
| Create webhook | `resend webhooks create --endpoint https://... --events all` |
| Listen for webhooks | `resend webhooks listen --url <tunnel-url>` |
| Listen for inbound | `resend emails receiving listen` |
| Check auth status | `resend whoami` |
| Run diagnostics | `resend doctor` |

## Global Flags

Apply to any command, placed before the subcommand:

- `--api-key <key>` -- Override API key
- `-p, --profile <name>` -- Use specific profile
- `--json` -- Force JSON output (automatic when piped)
- `-q, --quiet` -- Suppress spinners, implies `--json`

## Output Behavior

- **Interactive** (TTY): Formatted text + spinners on stderr
- **Machine** (piped/CI/`--json`): JSON on stdout, nothing on stderr
- Errors always: `{"error":{"message":"...","code":"..."}}` + exit code `1`

## Pagination

Most list commands support: `--limit <1-100>` (default 10), `--after <cursor>`, `--before <cursor>`.

## Command Reference

For complete flags and options for every command, see [references/commands.md](references/commands.md).

Top-level command groups:

- **emails** -- Send, list, get, batch, cancel, update, receiving (inbound)
- **domains** -- Create, list, get, verify, update, delete
- **api-keys** -- Create, list, delete
- **broadcasts** -- Create, send, list, get, update, delete
- **templates** -- Create, list, get, update, publish, duplicate, delete
- **contacts** -- Create, list, get, update, delete, segments, topics
- **contact-properties** -- Create, list, get, update, delete
- **segments** -- Create, list, get, delete
- **topics** -- Create, list, get, update, delete
- **webhooks** -- Create, list, get, update, delete, listen
- **auth** -- login, logout, list, switch, rename, remove profiles

## Common Patterns

### Pipe HTML from stdin

```bash
cat newsletter.html | ~/.resend/bin/resend emails send --from "<FROM>" --to user@example.com --subject "Newsletter" --html-file -
```

### Batch send from JSON

```json
[
  {"from": "<FROM>", "to": ["a@example.com"], "subject": "Hi A", "text": "Hello A"},
  {"from": "<FROM>", "to": ["b@example.com"], "subject": "Hi B", "text": "Hello B"}
]
```

```bash
~/.resend/bin/resend emails batch --file batch.json
```

### Forward inbound email

```bash
~/.resend/bin/resend emails receiving forward <email-id> --to user@example.com --from "<FROM>"
```

### Create and send broadcast

```bash
~/.resend/bin/resend broadcasts create --from "<FROM>" --subject "Announcement" --segment-id seg_abc --html "<h1>News</h1>" --send
```

### Dev webhook tunnel

```bash
~/.resend/bin/resend webhooks listen --url https://abc123.ngrok.io --forward-to http://localhost:3000/webhooks --events email.delivered email.bounced
```
