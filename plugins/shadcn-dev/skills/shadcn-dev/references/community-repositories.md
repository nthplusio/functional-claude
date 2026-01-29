# Top Community Repositories

Curated list of high-quality shadcn/ui and Tailwind CSS v4 repositories for learning patterns, solving problems, and expanding knowledge.

## shadcn/ui Repositories

### 1. shadcn-ui/ui (Official)
**URL**: https://github.com/shadcn-ui/ui
**Stars**: 75k+
**Use for**: Component source code, official patterns, understanding internals

Key files to study:
- `apps/www/registry/` - All component source code
- `apps/www/components/` - Website components
- `packages/shadcn/` - CLI source

### 2. shadcn-ui/taxonomy
**URL**: https://github.com/shadcn-ui/taxonomy
**Stars**: 18k+
**Use for**: Full application example, dashboard patterns, auth flows

Notable patterns:
- App Router structure
- Authentication with NextAuth
- Dashboard layouts
- Markdown editor integration

### 3. steven-tey/novel
**URL**: https://github.com/steven-tey/novel
**Stars**: 13k+
**Use for**: Notion-like WYSIWYG editor, complex component composition

Learn:
- TipTap editor integration
- Slash command menus
- AI autocomplete patterns

### 4. sadmann7/skateshop
**URL**: https://github.com/sadmann7/skateshop
**Stars**: 6k+
**Use for**: E-commerce patterns, product pages, cart functionality

Key features:
- Server Components with shadcn
- Stripe integration
- Product filtering with nuqs

### 5. calcom/cal.com
**URL**: https://github.com/calcom/cal.com
**Stars**: 33k+
**Use for**: Scheduling app, complex form patterns, timezone handling

Study:
- Multi-step booking flows
- Calendar components
- Availability management

### 6. dubinc/dub
**URL**: https://github.com/dubinc/dub
**Stars**: 20k+
**Use for**: Link management, analytics dashboards, API design

Notable:
- Edge runtime usage
- Real-time analytics
- QR code generation

### 7. mxkaske/mxkaske.dev
**URL**: https://github.com/mxkaske/mxkaske.dev
**Stars**: 1k+
**Use for**: Component patterns, blog implementations, MDX integration

### 8. jolly-ui/jolly-ui
**URL**: https://github.com/jolly-ui/jolly-ui
**Stars**: 500+
**Use for**: Alternative accessible variants, React Aria integration

Differs from shadcn by using React Aria instead of Radix UI.

## Tailwind CSS Repositories

### 9. tailwindlabs/tailwindcss
**URL**: https://github.com/tailwindlabs/tailwindcss
**Stars**: 85k+
**Use for**: Understanding v4 internals, plugin development, configuration

Key v4 files:
- `packages/tailwindcss/` - Core v4 source
- `integrations/` - Framework integrations

### 10. ibelick/background-snippets
**URL**: https://github.com/ibelick/background-snippets
**Stars**: 3k+
**Use for**: Creative background patterns, gradient techniques, visual effects

## How to Use These Repositories

### Learning Patterns

1. Clone the repository locally
2. Search for specific component implementations
3. Study how they compose shadcn components
4. Note testing and accessibility patterns

### Problem Solving

When stuck on an implementation:
1. Search GitHub for similar implementations
2. Check how these repos solved the problem
3. Adapt patterns to your use case

### Example Searches

```bash
# Find dialog implementations
grep -r "Dialog" --include="*.tsx" .

# Find form patterns
grep -r "useForm" --include="*.tsx" .

# Find data table implementations
grep -r "DataTable" --include="*.tsx" .
```

## Repository Evaluation Criteria

When evaluating community repos:

1. **Activity**: Recent commits indicate maintenance
2. **Stars**: Community validation
3. **Issues**: Check for unresolved critical issues
4. **Dependencies**: Ensure compatible versions
5. **Code quality**: TypeScript, testing, documentation

## Keeping Current

These repositories evolve. To stay updated:

1. Star repos on GitHub for notifications
2. Follow shadcn on Twitter (@shadcn)
3. Check shadcn changelog: https://ui.shadcn.com/docs/changelog
4. Monitor Tailwind v4 releases

## Additional Resources

### Discord Communities
- shadcn/ui Discord: Community discussions
- Tailwind CSS Discord: Official support

### YouTube Channels
- shadcn: Official tutorials
- Theo (t3.gg): Implementation reviews
- Web Dev Simplified: Component tutorials

### Blogs
- https://ui.shadcn.com/docs/changelog - Official updates
- https://tailwindcss.com/blog - Tailwind announcements
