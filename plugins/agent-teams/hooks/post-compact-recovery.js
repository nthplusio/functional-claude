// Injects recovery instructions after compaction
// Note: Using stdout instead of hookSpecificOutput.additionalContext
// due to Claude Code bug #16538 where plugin SessionStart hooks
// don't surface additionalContext. Stdout IS surfaced for SessionStart.
process.stdout.write("Context was just compacted. BEFORE doing anything else: (1) Call TaskList to see all tasks and their current status. (2) Call TaskGet on any task assigned to you that is in_progress. (3) Read the progress notes in the task description to understand where you left off. (4) Resume work from that point.");
