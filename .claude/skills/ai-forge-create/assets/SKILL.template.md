---
name: [skill-name]
description: "[Third-person imperative — 'Creates…', 'Analyzes…'. WHAT + WHEN + keywords. End with: Don't use for [anti-scenario]. Max 1,024 chars. No colons, no angle brackets.]"
---

# [Skill Title]

[One leading-word sentence that anchors the skill's core concept. A leading word recruits pretrained priors without spending definition tokens — repeat the word in the body to build a distributed definition.]

## Phase 1 — [First Action Phase]

[Before writing instructions, ask: "Does Claude already know this?" If yes, delete it. If it's a useful reminder, one line max.]

MANDATORY READ [`references/[file].md`](references/[file].md) before [action]. Do NOT load `references/[other].md` until Phase 2.

1. [Third-person imperative — "Extract…", "Run…", "Validate…" — never "you should" or "please"]
2. [If referencing an asset: "Read `assets/[template].md` and use it as the starting structure."]

Completion criterion: [checkable and exhaustive — "every X has a Y", not "produce a list"].

## Phase 2 — [Second Action Phase]

1. [Decision branch: "If X, run `node scripts/[script].cjs`. Otherwise, skip to step 2."]
2. [Instruction.]

Completion criterion: [checkable condition].

## Error Handling

- If `scripts/[script].cjs` fails: read stderr, self-correct the input, re-run once. Surface to user if it fails again.
- If [condition B]: read `references/[troubleshooting].md` and follow the recovery steps.

## NEVER

- **NEVER [specific anti-pattern]**
  **Instead:** [concrete alternative — what to do instead]
  **Why:** [non-obvious failure mode this prevents — the incident or invariant that makes this rule load-bearing]
