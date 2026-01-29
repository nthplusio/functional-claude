---
description: Analyze project for shadcn/ui and Tailwind CSS setup, recommend components
argument-hint: [focus-area]
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# shadcn/ui Project Reconnaissance

Analyze the current React project's shadcn/ui and Tailwind CSS configuration to provide setup recommendations.

## Analysis Steps

### 1. Detect Project Framework

Identify the React framework in use:

```bash
# Check package.json for framework
grep -E "\"next\"|\"vite\"|\"@tanstack/start\"|\"remix\"|\"expo\"" package.json
```

Frameworks to detect:
- Next.js (App Router or Pages)
- Vite
- TanStack Start
- Remix
- Expo

### 2. Check shadcn/ui Installation

Look for shadcn configuration:

- `components.json` - shadcn configuration file
- `components/ui/` - Component directory
- `lib/utils.ts` - cn() utility

If not found, recommend initialization:
```bash
npx shadcn@latest init
```

### 3. Analyze Tailwind Configuration

**For Tailwind v3:**
- Check `tailwind.config.js` or `tailwind.config.ts`
- Verify content paths include all component directories
- Check for CSS variable theme configuration

**For Tailwind v4:**
- Check for `@import "tailwindcss"` in CSS
- Look for `@theme` blocks
- Verify PostCSS/Vite plugin setup

### 4. Audit CSS Variables

Read the global CSS file and verify:
- All required shadcn CSS variables present
- Proper HSL format (H S% L%)
- Dark mode variables defined
- `@layer base` wrapper used

### 5. Check Installed Components

List components in `components/ui/`:

```bash
ls components/ui/ 2>/dev/null | grep -E "\.tsx$"
```

### 6. Identify Missing Dependencies

Check for common missing packages:

```bash
npm ls class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-dialog
```

### 7. Review Project Structure

Assess the overall structure:
- Path aliases configured (@/)
- Proper component organization
- Consistent import patterns

## Output Format

Provide a structured report:

```markdown
## Project Analysis: [Project Name]

### Framework
- **Detected**: Next.js 14 (App Router)
- **Status**: ✅ Supported

### shadcn/ui Status
- **Initialized**: Yes/No
- **Components installed**: X components
- **Style**: New York / Default

### Tailwind CSS
- **Version**: v3.4 / v4.0
- **Configuration**: Valid / Issues found
- **CSS Variables**: Complete / Missing [list]

### Recommendations

#### Immediate Actions
1. [Action item]
2. [Action item]

#### Suggested Components
Based on your project, consider adding:
- `button` - Basic interaction
- `card` - Content containers
- `dialog` - Modal interactions
- `form` - Form validation

### Commands to Run
\`\`\`bash
# Install missing dependencies
npm install [packages]

# Add recommended components
npx shadcn@latest add button card dialog form
\`\`\`
```

## Focus Areas

If `$ARGUMENTS` specifies a focus area, prioritize that analysis:

- `forms` - Focus on form components and validation setup
- `theming` - Deep dive into theme configuration
- `tables` - Check data table setup and TanStack Table
- `auth` - Look for authentication-related components
- `dashboard` - Analyze dashboard layout components

## Tips

- Always check both the configuration files AND actual usage
- Look for inconsistencies between config and implementation
- Check for outdated component versions
- Verify TypeScript path aliases match actual structure
- Consider the project's specific needs when recommending components
