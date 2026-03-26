# Resend CLI Complete Command Reference

## Table of Contents

- [Global Options](#global-options)
- [emails](#emails)
- [domains](#domains)
- [api-keys](#api-keys)
- [broadcasts](#broadcasts)
- [templates](#templates)
- [contacts](#contacts)
- [contact-properties](#contact-properties)
- [segments](#segments)
- [topics](#topics)
- [webhooks](#webhooks)
- [auth](#auth)
- [Standalone Commands](#standalone-commands)

## Global Options

Apply to any command, placed before the subcommand:

| Flag | Description |
|------|-------------|
| `--api-key <key>` | Override API key for this invocation |
| `-p, --profile <name>` | Profile to use (overrides `RESEND_PROFILE`) |
| `--json` | Force JSON output even in interactive terminals |
| `-q, --quiet` | Suppress spinners and status output (implies `--json`) |
| `--insecure-storage` | Save API key as plaintext instead of secure storage |
| `-v, --version` | Print version and exit |
| `--help` | Show help text |

## Output Behavior

| Mode | When | Stdout | Stderr |
|------|------|--------|--------|
| Interactive | Terminal (TTY) | Formatted text | Spinners, prompts |
| Machine | Piped, CI, or `--json` | JSON | Nothing |

Errors always produce structured JSON: `{"error":{"message":"...","code":"..."}}` with exit code `1`.

---

## emails

### `resend emails list` (default, alias: `ls`)

| Flag | Description |
|------|-------------|
| `--limit <n>` | Max results 1-100 (default: 10) |
| `--after <cursor>` | Forward pagination cursor |
| `--before <cursor>` | Backward pagination cursor |

### `resend emails send`

| Flag | Required | Description |
|------|----------|-------------|
| `--from <address>` | Yes (unless `--template`) | Sender address |
| `--to <addresses...>` | Yes | One or more recipients |
| `--subject <subject>` | Yes (unless `--template`) | Subject line |
| `--text <text>` | One of text/html/etc | Plain text body |
| `--html <html>` | One of text/html/etc | HTML body string |
| `--html-file <path>` | One of text/html/etc | HTML file path (`"-"` for stdin) |
| `--text-file <path>` | One of text/html/etc | Text file path (`"-"` for stdin) |
| `--react-email <path>` | One of text/html/etc | React Email .tsx template to render |
| `--cc <addresses...>` | No | CC recipients |
| `--bcc <addresses...>` | No | BCC recipients |
| `--reply-to <address>` | No | Reply-to address |
| `--scheduled-at <datetime>` | No | Schedule for later (ISO 8601 or natural language) |
| `--attachment <paths...>` | No | File paths to attach |
| `--headers <key=value...>` | No | Custom headers |
| `--tags <name=value...>` | No | Email tags |
| `--idempotency-key <key>` | No | Deduplication key |
| `--template <id>` | No | Template ID (mutually exclusive with body flags) |
| `--var <key=value...>` | No | Template variables (requires `--template`) |

Body content is required via one of: `--text`, `--html`, `--html-file`, `--text-file`, `--react-email`, or `--template`.

### `resend emails get [id]`

Retrieve a sent email by ID.

### `resend emails batch`

Send up to 100 emails in a single API call.

| Flag | Description |
|------|-------------|
| `--file <path>` | Path to JSON file (array of email objects; `"-"` for stdin) |
| `--react-email <path>` | Render .tsx template and apply HTML to all batch emails |
| `--idempotency-key <key>` | Deduplication key |
| `--batch-validation <mode>` | `strict` (fail all, default) or `permissive` (partial success) |

### `resend emails cancel [id]`

Cancel a scheduled email.

### `resend emails update [id]`

| Flag | Required | Description |
|------|----------|-------------|
| `--scheduled-at <datetime>` | Yes | New scheduled date (ISO 8601) |

### `resend emails receiving list` (alias: `ls`)

List received inbound emails. Pagination: `--limit`, `--after`, `--before`.

### `resend emails receiving get [id]`

Retrieve received email with full details (HTML, text, headers, raw download URL).

### `resend emails receiving listen`

Long-running poll for new inbound emails.

| Flag | Description |
|------|-------------|
| `--interval <seconds>` | Polling interval, minimum 2 (default: 5) |

### `resend emails receiving attachments [emailId]`

List attachments on a received email. Pagination flags available.

### `resend emails receiving attachment <emailId> <attachmentId>`

Retrieve a single attachment with its signed download URL.

### `resend emails receiving forward [id]`

| Flag | Required | Description |
|------|----------|-------------|
| `--to <addresses...>` | Yes | Recipient(s) |
| `--from <address>` | Yes | Sender address |

---

## domains

### `resend domains list` (default, alias: `ls`)

Pagination: `--limit`, `--after`, `--before`.

### `resend domains create`

| Flag | Description |
|------|-------------|
| `--name <domain>` | Domain name (required) |
| `--region <region>` | `us-east-1`, `eu-west-1`, `sa-east-1`, or `ap-northeast-1` |
| `--tls <mode>` | `opportunistic` (default) or `enforced` |
| `--sending` | Enable sending capability |
| `--receiving` | Enable receiving capability |

### `resend domains get [id]`

Retrieve domain details including DNS records and verification status.

### `resend domains verify [id]`

Trigger async DNS verification.

### `resend domains update [id]`

| Flag | Description |
|------|-------------|
| `--tls <mode>` | `opportunistic` or `enforced` |
| `--open-tracking` / `--no-open-tracking` | Toggle open tracking |
| `--click-tracking` / `--no-click-tracking` | Toggle click tracking |

### `resend domains delete [id]` (alias: `rm`)

`--yes` to skip confirmation.

---

## api-keys

### `resend api-keys list` (default, alias: `ls`)

List all API keys (IDs and names; tokens are never returned).

### `resend api-keys create`

| Flag | Description |
|------|-------------|
| `--name <name>` | Key name, max 50 chars (required in non-interactive) |
| `--permission <perm>` | `full_access` or `sending_access` |
| `--domain-id <id>` | Restrict sending_access key to one domain |

Token shown once at creation, cannot be retrieved again.

### `resend api-keys delete [id]` (alias: `rm`)

`--yes` to skip confirmation.

---

## broadcasts

Lifecycle: create (draft) -> send -> delivered. Supports scheduling.

### `resend broadcasts list` (default, alias: `ls`)

Pagination: `--limit`, `--after`, `--before`.

### `resend broadcasts create`

| Flag | Description |
|------|-------------|
| `--from <address>` | Sender address (required) |
| `--subject <subject>` | Subject line (required) |
| `--segment-id <id>` | Target segment (required) |
| `--html <html>` | HTML body (supports `{{{VAR\|fallback}}}` interpolation) |
| `--html-file <path>` | HTML file (`"-"` for stdin) |
| `--text <text>` | Plain text body |
| `--text-file <path>` | Text file (`"-"` for stdin) |
| `--react-email <path>` | React Email .tsx template |
| `--name <name>` | Internal label |
| `--reply-to <address>` | Reply-to address |
| `--preview-text <text>` | Inbox preview text |
| `--topic-id <id>` | Associate with a topic |
| `--send` | Send immediately instead of saving as draft |
| `--scheduled-at <datetime>` | Schedule delivery (only with `--send`) |

### `resend broadcasts send [id]`

| Flag | Description |
|------|-------------|
| `--scheduled-at <datetime>` | Schedule delivery (ISO 8601 or natural language) |

Only API-created drafts can be sent via CLI; dashboard broadcasts cannot.

### `resend broadcasts get [id]`

Full broadcast details including HTML body.

### `resend broadcasts update [id]`

Same body flags as create, plus `--from`, `--subject`, `--name`. Only drafts can be updated.

### `resend broadcasts delete [id]` (alias: `rm`)

`--yes` to skip confirmation.

### `resend broadcasts open [id]`

Open broadcast (or list) in browser.

---

## templates

### `resend templates list` (default, alias: `ls`)

Pagination: `--limit`, `--after`, `--before`.

### `resend templates create`

| Flag | Description |
|------|-------------|
| `--name <name>` | Template name (required) |
| `--html <html>` | HTML body |
| `--html-file <path>` | HTML file (`"-"` for stdin) |
| `--react-email <path>` | React Email .tsx template |
| `--subject <subject>` | Subject line |
| `--text <text>` | Plain text body |
| `--text-file <path>` | Text file (`"-"` for stdin) |
| `--from <address>` | Default sender |
| `--reply-to <address>` | Reply-to |
| `--alias <alias>` | Template alias for lookup by name |
| `--var <var...>` | Variable declaration: `KEY:type` or `KEY:type:fallback` (types: string, number) |

### `resend templates get [id]`

Retrieve by ID or alias. Returns full details including HTML, variables, status.

### `resend templates update [id]`

Same flags as create. At least one option required.

### `resend templates publish [id]`

Promote a draft to published status.

### `resend templates duplicate [id]`

Copy a template as a new draft.

### `resend templates delete [id]` (alias: `rm`)

`--yes` to skip confirmation.

### `resend templates open [id]`

Open template (or list) in browser.

---

## contacts

Contacts are global entities identified by UUID or email.

### `resend contacts list` (default, alias: `ls`)

Pagination: `--limit`, `--after`, `--before`.

### `resend contacts create`

| Flag | Description |
|------|-------------|
| `--email <email>` | Email address (required) |
| `--first-name <name>` | First name |
| `--last-name <name>` | Last name |
| `--unsubscribed` | Global opt-out from all broadcasts |
| `--properties <json>` | Custom properties as JSON string |
| `--segment-id <id...>` | Segment(s) to add contact to on creation (repeatable) |

### `resend contacts get [id]`

Retrieve by UUID or email.

### `resend contacts update [id]`

| Flag | Description |
|------|-------------|
| `--unsubscribed` | Set global unsubscribe |
| `--no-unsubscribed` | Clear global unsubscribe |
| `--properties <json>` | Merge JSON properties (set key to null to clear) |

### `resend contacts delete [id]` (alias: `rm`)

`--yes` to skip confirmation. Accepts UUID or email.

### `resend contacts segments [id]`

List segments a contact belongs to.

### `resend contacts add-segment [contactId]`

`--segment-id <id>` -- Add contact to a segment.

### `resend contacts remove-segment [contactId] [segmentId]`

Remove contact from a segment.

### `resend contacts topics [id]`

List a contact's topic subscriptions.

### `resend contacts update-topics [id]`

`--topics <json>` -- JSON array: `[{"id":"topic-uuid","subscription":"opt_in"}]`.

---

## contact-properties

Schema definitions for custom data on contacts.

### `resend contact-properties list` (default, alias: `ls`)

Pagination: `--limit`, `--after`, `--before`.

### `resend contact-properties create`

| Flag | Description |
|------|-------------|
| `--key <key>` | Property key name (required) |
| `--type <type>` | `string` or `number` (required) |
| `--fallback-value <value>` | Default value for broadcast interpolation |

Reserved keys: `FIRST_NAME`, `LAST_NAME`, `EMAIL`, `UNSUBSCRIBE_URL`.

### `resend contact-properties get [id]`

Retrieve a property definition.

### `resend contact-properties update [id]`

| Flag | Description |
|------|-------------|
| `--fallback-value <value>` | New fallback value |
| `--clear-fallback-value` | Remove fallback (set to null) |

Key and type are immutable after creation.

### `resend contact-properties delete [id]` (alias: `rm`)

`--yes` to skip confirmation. Removes property from ALL contacts permanently.

---

## segments

### `resend segments list` (default, alias: `ls`)

Pagination: `--limit`, `--after`, `--before`.

### `resend segments create`

`--name <name>` -- Segment name (required).

### `resend segments get [id]`

### `resend segments delete [id]` (alias: `rm`)

`--yes` to skip confirmation. Does NOT delete contacts, only the grouping.

No update command; to rename, delete and recreate.

---

## topics

### `resend topics list` (default, alias: `ls`)

### `resend topics create`

| Flag | Description |
|------|-------------|
| `--name <name>` | Topic name (required) |
| `--description <desc>` | Description shown to contacts |
| `--default-subscription <mode>` | `opt_in` (default) or `opt_out` |

### `resend topics get [id]`

### `resend topics update [id]`

| Flag | Description |
|------|-------------|
| `--name <name>` | New name |
| `--description <desc>` | New description |

`--default-subscription` cannot be changed after creation.

### `resend topics delete [id]` (alias: `rm`)

`--yes` to skip confirmation.

---

## webhooks

17 event types:
- **Email:** `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.opened`, `email.clicked`, `email.failed`, `email.scheduled`, `email.suppressed`, `email.received`
- **Contact:** `contact.created`, `contact.updated`, `contact.deleted`
- **Domain:** `domain.created`, `domain.updated`, `domain.deleted`

### `resend webhooks list` (default, alias: `ls`)

Pagination: `--limit`, `--after`, `--before`.

### `resend webhooks create`

| Flag | Description |
|------|-------------|
| `--endpoint <url>` | HTTPS URL (required) |
| `--events <events...>` | Event types, or `"all"` for all 17 (required) |

Returns `signing_secret` (shown once; for Svix signature verification).

### `resend webhooks get [id]`

### `resend webhooks update [id]`

| Flag | Description |
|------|-------------|
| `--endpoint <url>` | New HTTPS URL |
| `--events <events...>` | Replace full event list (or `"all"`) |
| `--status <status>` | `enabled` or `disabled` |

### `resend webhooks delete [id]` (alias: `rm`)

`--yes` to skip confirmation.

### `resend webhooks listen`

Start a local server to receive webhook events during development.

| Flag | Description |
|------|-------------|
| `--url <url>` | Public tunnel URL (e.g. ngrok URL) -- required |
| `--forward-to <url>` | Forward payloads to a local URL (with Svix headers) |
| `--events <events...>` | Event types to listen for (default: all) |
| `--port <port>` | Local server port (default: 4318) |

Creates a temporary webhook, displays events in terminal, deletes webhook on Ctrl+C.

---

## auth

### `resend login` (alias: `resend auth login`)

Save API key. `--key <key>` required in non-interactive mode.

### `resend logout` (alias: `resend auth logout`)

Remove saved API key(s). `--profile <name>` to remove only one profile.

### `resend auth list` (default)

List all configured profiles.

### `resend auth switch [name]`

Switch the active profile.

### `resend auth rename [old-name] [new-name]`

Rename a profile.

### `resend auth remove [name]`

Remove a profile and its stored API key.

---

## Standalone Commands

### `resend doctor`

Run environment diagnostics: CLI version, API key validity, domain status, AI agent integrations.

### `resend whoami`

Show current auth status (local only, no network calls). Displays active profile, masked API key, source, permission level.

### `resend open`

Open the Resend dashboard in default browser.

### `resend update`

Check for available CLI updates from GitHub releases.

### `resend completion [shell]`

Generate shell completion scripts. `--install` to install into shell profile. Supported: `bash`, `zsh`, `fish`, `powershell`.
