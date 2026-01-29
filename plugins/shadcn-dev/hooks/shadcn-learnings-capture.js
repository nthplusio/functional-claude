#!/usr/bin/env node
// shadcn-learnings-capture.js
// Stop hook that checks if session involved shadcn/Tailwind work and prompts for learnings
//
// Input: JSON with session info and transcript_path on stdin
// Output: JSON with ok:false and reason if learnings should be captured

const fs = require('fs');

// Read JSON input from stdin
let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');

    // Check if stop_hook_active is true (already continuing from a stop hook)
    if (data.stop_hook_active === true) {
      console.log(JSON.stringify({ ok: true }));
      process.exit(0);
    }

    // Get transcript path from input
    const transcriptPath = data.transcript_path;

    if (!transcriptPath || !fs.existsSync(transcriptPath)) {
      console.log(JSON.stringify({ ok: true }));
      process.exit(0);
    }

    // Read transcript and check for shadcn/Tailwind-related work
    const transcript = fs.readFileSync(transcriptPath, 'utf8');

    // Pattern categories for detection
    const patterns = {
      // shadcn/ui
      shadcn: /shadcn|@\/components\/ui|npx shadcn|shadcn-ui|shadcn\/ui/i,

      // Component names
      components: /\b(Button|Card|Dialog|Input|Label|Select|Checkbox|RadioGroup|Tabs|Table|Form|Toast|Popover|Command|DropdownMenu|AlertDialog|Sheet|Accordion|Avatar|Badge|Calendar|Carousel|Collapsible|Combobox|ContextMenu|DataTable|DatePicker|Drawer|HoverCard|Menubar|NavigationMenu|Pagination|Progress|ResizablePanels|ScrollArea|Separator|Skeleton|Slider|Sonner|Switch|Textarea|Toggle|Tooltip)\b/,

      // Tailwind v4
      tailwindV4: /tailwindcss@next|@tailwindcss\/vite|@tailwindcss\/postcss|tailwind\.css|@import\s*['"]tailwindcss['"]/i,

      // Tailwind general
      tailwind: /tailwind\.config|tailwindcss|@apply|className.*(?:flex|grid|p-|m-|text-|bg-|border-|rounded)/i,

      // CSS variables and theming
      theming: /--radius|--background|--foreground|--primary|--secondary|--muted|--accent|--destructive|--card|--popover|hsl\(var\(--/i,

      // Skills
      skills: /shadcn-dev|shadcn-components|shadcn-theming|shadcn-forms|shadcn-tables|shadcn-patterns/i,

      // Installation and CLI
      installation: /npx\s+shadcn|components\.json|init\s+shadcn|add\s+button|add\s+card|add\s+form/i,

      // Forms and validation
      forms: /react-hook-form|zodResolver|useForm|FormField|FormItem|FormLabel|FormControl|FormMessage/i,

      // Data tables
      tables: /@tanstack\/react-table|useReactTable|ColumnDef|DataTable|getCoreRowModel|getFilteredRowModel|getPaginationRowModel/i
    };

    // Check if any pattern matches
    let matched = false;
    const matchedCategories = [];

    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(transcript)) {
        matched = true;
        matchedCategories.push(category);
      }
    }

    if (matched) {
      // Build contextual message based on what was detected
      let reason = "This session involved shadcn/Tailwind work";

      if (matchedCategories.includes('forms')) {
        reason += " (forms and validation)";
      } else if (matchedCategories.includes('tables')) {
        reason += " (data tables)";
      } else if (matchedCategories.includes('theming')) {
        reason += " (theming and CSS variables)";
      } else if (matchedCategories.includes('installation')) {
        reason += " (component installation)";
      } else if (matchedCategories.includes('tailwindV4')) {
        reason += " (Tailwind v4)";
      }

      reason += ". Consider capturing learnings:\n";
      reason += "- Successful Patterns: Component configurations that worked well\n";
      reason += "- Mistakes to Avoid: Issues encountered and solutions\n";
      reason += "- Theme Customizations: Useful CSS variable patterns";

      console.log(JSON.stringify({
        ok: false,
        reason: reason
      }));
      process.exit(0);
    }

    console.log(JSON.stringify({ ok: true }));
    process.exit(0);

  } catch (err) {
    // On any error, return ok to avoid blocking
    console.log(JSON.stringify({ ok: true }));
    process.exit(0);
  }
});

// Handle stdin errors gracefully
process.stdin.on('error', () => {
  console.log(JSON.stringify({ ok: true }));
  process.exit(0);
});
