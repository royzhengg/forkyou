Run the full type-check and fix all errors:

1. Run: `npx tsc --noEmit`
2. For each error: read only the affected file, make the minimal fix.
3. Re-run until clean.
4. Report: file paths and what changed. Nothing else.
