# Centralized Mock Repository

Convention and protocol for shared mock fixtures across team sessions. Mocks stored in `docs/mocks/[domain]/` are reusable across spawns, reducing duplicate fixture creation and ensuring consistency.

## Why This Exists

Without centralized mocks, every Tester creates fixtures from scratch. This wastes tokens, introduces inconsistency (different spawns mock the same entity differently), and misses the opportunity to build a reusable test asset library. A shared mock directory lets Testers check for existing fixtures before creating new ones and contribute new mocks back for future sessions.

## Convention

### Directory Structure

```
docs/mocks/
├── README.md              # Convention documentation (created on first use)
├── [domain]/              # Domain grouping (e.g., auth, payments, users)
│   ├── [entity].mock.ts   # TypeScript mock fixtures
│   ├── [entity].mock.json # JSON mock data
│   └── ...
```

### Naming

- **Domain:** Kebab-case grouping by business domain (e.g., `auth`, `payments`, `user-management`)
- **Entity:** Kebab-case entity name matching the codebase model (e.g., `user.mock.ts`, `invoice.mock.json`)
- **Extension:** `.mock.ts` for TypeScript fixtures with factories/builders, `.mock.json` for static data

### README Template

When the first mock is contributed, create `docs/mocks/README.md`:

```markdown
# Mock Repository

Shared mock fixtures for testing. Testers check here before creating new mocks and contribute new mocks back after creating them.

## Convention

- **Location:** `docs/mocks/[domain]/[entity].mock.{ts,json}`
- **Domain grouping:** Group by business domain (auth, payments, users, etc.)
- **Naming:** Match entity names from the codebase

## Usage

1. Check `docs/mocks/` for existing mocks before creating new fixtures
2. Import from here in your tests: `import { mockUser } from '../../docs/mocks/auth/user.mock'`
3. After creating new mocks, copy them to the appropriate domain directory
```

## Tester Integration

The Tester's first mock-related step should always be: **"Check `docs/mocks/` for existing mocks."**

### Tester Instructions (injected into spawn-build feature mode)

Add to the Tester teammate description in the spawn prompt:

```
Before creating any test fixtures, check `docs/mocks/` for existing mocks.
Report found mocks in your task output: "Using N existing mocks from docs/mocks/[domain]/".
After creating new mocks, contribute them back to `docs/mocks/[domain]/` for future reuse.
```

### Tester Task Output

Include mock usage in the Tester's task output:

```markdown
### Mock Usage
- **Existing mocks used:** [list from docs/mocks/ or "none found"]
- **New mocks created:** [list of new mocks contributed back to docs/mocks/]
```

## Project Analysis Integration

During the project analysis step (before spawning), scan for `docs/mocks/` and report:

```
Mock repository: Found [N] mocks in [M] domains at docs/mocks/
Domains: [list of domain directories]
```

If `docs/mocks/` doesn't exist, report: `Mock repository: Not found (will be created if Tester generates mocks)`
