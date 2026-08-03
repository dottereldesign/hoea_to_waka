# Agent Notes

## Visual verification

- In this repository/environment, do not rely on the built-in browser MCP for rendered checks. It cannot create its working directory reliably here.
- When a visual before/after check is needed, use local shell tools and a local screenshot path instead.
- Prefer a rendered verification workflow that captures screenshots before and after CSS or layout changes.

## Publishing

- After each completed website update, commit the intended changes and push them directly to `origin/main`.
- Do not leave completed website changes only in the local worktree unless the user explicitly requests a local-only update.
