# Template-Aware Email Workflow

Resend templates store reusable email formats with variable substitution. This workflow integrates template discovery into the sending process.

**Note:** All CLI commands in this file must include the global auth flag per SKILL.md § CLI Pre-flight. Omitted from examples for brevity.

## Pre-Send: Check for Matching Templates

Before composing an email, fetch the template list:

```bash
~/.resend/bin/resend --api-key "$RESEND_API_KEY" templates list --json --quiet
```

Or via MCP if the CLI is not installed (`mcp__resend__list_templates`).

### Matching Logic

Compare the email's purpose against template **names** and **aliases**. Match on:
- Direct name match (e.g., user says "send a welcome email" and template named `welcome-email` exists)
- Subject similarity (e.g., email subject "Weekly Status Update" matches template `weekly-status-update`)
- Purpose keywords (e.g., "invoice", "reminder", "onboarding" appear in template names)

### If Match Found

Present the match to the user:

> Found template **"weekly-status-update"** — would you like to use it?

If the user agrees:

1. Fetch the template to see its variables: `resend templates get <id> --json --quiet`
2. Identify which variables need values from context
3. Send using the template:

```bash
~/.resend/bin/resend emails send \
  --from "<FROM>" \
  --to "<TO>" \
  --template <template-id> \
  --var name=Alice \
  --var week="March 31"
```

If the user declines, compose the email normally.

### If No Match

Proceed with normal email composition. The post-send step below will offer to create a template.

## Post-Send: Offer Template Creation

After sending an email that did **not** use a template, evaluate whether it's a good template candidate:

**Good candidates:**
- Emails the user is likely to send again (status updates, notifications, reports)
- Emails with a consistent structure but variable content (names, dates, project details)
- Emails the user explicitly describes as recurring ("send this every week", "use this format")

**Skip offering for:**
- Clearly one-off emails ("tell Bob the meeting is moved to 3pm")
- Very short plain-text messages with no structure

### Creating the Template

If offering makes sense:

> Would you like to save this as a template for future emails like this?

If the user agrees:

1. **Name**: Derive a slug from the email's purpose (e.g., `weekly-status-update`, `client-invoice`, `onboarding-welcome`)
2. **Variables**: Identify parts of the email that would change between sends. Convert them to template variables using `{{variable_name}}` syntax in the HTML/text:
   - Recipient names → `{{name}}`
   - Dates → `{{date}}`, `{{week}}`
   - Project-specific content → `{{project}}`, `{{summary}}`
   - Numbers/amounts → `{{amount}}`, `{{count}}`
3. **Create**:

```bash
~/.resend/bin/resend templates create \
  --name "<template-name>" \
  --subject "<subject-with-variables>" \
  --html "<html-with-variables>" \
  --from "<FROM>" \
  --alias "<template-name>" \
  --var name:string \
  --var date:string
```

4. **Publish** (makes it available for sending):

```bash
~/.resend/bin/resend templates publish <template-id>
```

5. **Confirm** to the user:

> Template **"weekly-status-update"** created and published. Next time, I'll offer to use it when you send a similar email.

## Managing Templates

### List all templates

```bash
~/.resend/bin/resend templates list
```

### View a template's content and variables

```bash
~/.resend/bin/resend templates get <id-or-alias> --json --quiet
```

### Update an existing template

```bash
~/.resend/bin/resend templates update <id> --html "<updated-html>" --subject "<new-subject>"
```

Then re-publish if the template was already published:

```bash
~/.resend/bin/resend templates publish <id>
```

### Delete a template

```bash
~/.resend/bin/resend templates delete <id> --yes
```
