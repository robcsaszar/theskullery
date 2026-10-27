# Recon Phase — Agent Contract

## Research Agent Prompt Template

Inject verbatim into each domain agent. Replace `[DOMAIN]`, `[PATH]`, `[SCOPE_HINT]`, `[SKIP_IDS]`, `[CODEBASE_MAP]`.

```text
You are a domain specialist auditing the [DOMAIN] user flow.

Codebase: [PATH]
Scope: [SCOPE_HINT or "all layers"]

Codebase context (read this before touching any file):
---
[CODEBASE_MAP — omit on first run, inject on subsequent domains]
---

Prior confirmed findings to skip (already known):
[SKIP_IDS — comma-separated IDs, or "none"]

Your task: exhaustively audit the [DOMAIN] flow across every layer —
UI components (src/lib/components/, src/routes/), business logic (src/lib/, src/lib/svelte/),
API endpoints (src/api/routes/), the WebSocket client and reconnection
(packages/client-core/src/ws-client.ts), tests (tests/).

Audit angles — apply all of them:
1. SAD PATH. What happens when things fail? Error handlers, catch blocks, timeout paths.
   Are they handled with the same rigour as success paths?
2. BOUNDARIES. Empty input, null vs undefined, race between two concurrent actions,
   timer expiry, disconnect mid-action.
3. COMPONENT TRUST. Does component B assume component A validated? Where is trust implicit?
4. RECONNECTION. After network drop, does the client silently die or retry?
   What happens when the socket closes for good — is the user told, or does the page sit stale?
5. STATE ORDERING. Can events arrive out of order? Is state set before or after the stream opens?
6. DEAD CODE / DEPRECATED. Exports marked @deprecated still imported? Duplicated inline patterns?
7. COPY & TONE. "Please" softeners in validation messages? Exclamation marks in confirmations?
   Sentence case violations?
8. DOC DRIFT. Do flow docs (docs/flows/) reflect the actual behaviour in code?

For each issue, return a finding in this exact JSON shape:
{
  "id": "[DOMAIN_PREFIX]-[sequence]",
  "domain": "[DOMAIN]",
  "title": "short imperative description",
  "severity": "critical|high|medium|low",
  "files": [{"path": "src/...", "lines": [63, 75]}],
  "quote": "the exact code on files[0].lines[0], copied verbatim",
  "root_cause": "[component] in [file] does not [action], allowing [consequence]",
  "fix_approach": "concrete one-sentence description of the change",
  "test_cases": ["behaviour this test verifies"]
}

Return one JSON object and nothing else:
{"checked": ["<audit angle> — <where you looked>", ...], "findings": [<finding>, ...]}
`checked` lists every angle you ran and the files it covered, including the ones that found
nothing — an empty `findings` with no `checked` reads as an audit that never ran.
Do NOT write any files.
```

## Quality Bar

Reject findings that fail any of these before returning them:

- **File exists at the exact path cited** — do not cite a parent directory or a file you inferred
- **Line number matches the described code** — read the actual line; off-by-one or wrong function = reject
- **Root cause names the specific component** — "the app" or "the code" is not a root cause
- **Fix approach is concrete** — "improve error handling" is not concrete; "replace `.catch(() => {})` with `.then(async (res) => { if (res.status === 422) ... }).catch(() => {})` is

## Codebase Synthesis (after all domain agents return)

Synthesize `codebase-map.md` from all agent responses before Phase 2. Include:

- Per domain: its `checked` list, or **FAILED** when the agent returned no valid object twice
- Tech stack summary (framework, WebSocket client, test runner, linter)
- Key file paths per domain (routes, components, lib modules, tests)
- Shared modules used across domains (e.g. `packages/client-core/src/ws-client.ts`, `src/lib/game-store.ts`)
- Conventions in use (e.g. component library, header config pattern, WS client options shape)

This file is injected verbatim into every adversarial and verification agent. Its quality directly determines theirs.
