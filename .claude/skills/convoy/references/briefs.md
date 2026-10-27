# Briefs

One template per roster agent. The agent's body (`.claude/agents/<name>.md`) carries the standing rules — read-only or not, no commit, no stash, no full suite, the report shape, when to stop. A brief carries only what changes per spawn: the item, the verified facts, the files, the seam, the off-limits list. Each brief is self-contained because the agent sees none of the conversation; it is written to `.claude/log/<map>/briefs/NN-<agent>-<item>.md` and made read-only before the spawn, and the Agent prompt is `Read and execute <path>`.

## Contents

- [Implement (builder)](#implement-builder)
- [Delete (builder)](#delete-builder)
- [Review (reviewer)](#review-reviewer)
- [Audit (auditor)](#audit-auditor)
- [Drill (drill)](#drill-drill)
- [Doc sweep (sweeper)](#doc-sweep-sweeper)
- [Locate (scout)](#locate-scout)
- [Verify (verifier)](#verify-verifier)
- [The ping](#the-ping)

## Implement (builder)

One per route item or review-fix batch. Escalate to the orchestrator's own hands, not to a bigger model, when the item is auth, tokens, concurrency, timers, or a layout spanning layouts — the roster has one builder tier.

```text
Implement GitHub issue #<n> in <repo path>. Read the issue first: `gh issue view <n>`.
Also read <spec path>, `AGENTS.md`, `DESIGN.md`, and `docs/components.md`.

## Background (verified — trust this)
<3–6 facts the orchestrator has already established: where the data lives, which
component already renders X, which decision on the map settled Y. Cite file:line.
A fact the agent would otherwise spend twenty minutes rediscovering.>

## The change
<Numbered. Each step names the file(s) and states the change structurally — what the
diff should look like, not what the feature is for. Name the seam tests observe.>

## Tests (required)
<Seam named. 4–6 behaviours to assert, each one line. Prior art file named.>

## Off-limits
Other agents are editing: <the wave's other predicted sets>.
Orchestrator-owned this wave: <the standing list + any wave-hub file>.
Report the lines you need in any of these under NEEDED.
```

A rename item adds one line under **The change**: "Rename by type, file by file. A regex over `tests/` is forbidden — it cannot see the type." The three-meaning rule in a brief has been read and then bypassed by a bulk sed that broke six tests on a subject id that shared the word.

## Delete (builder)

For a route item whose work is removal — the contract half of an expand-then-contract pair. The Implement template with these additions under **The change**:

```text
This is a DELETION task. The replacement already shipped in <commit> — read it first.

Work by deletion, then follow the type errors — `pnpm typecheck` finds the orphans.
After deleting, grep `src/` and `tests/` for <every symbol being removed> and account
for EVERY remaining hit: it either belongs to <the surviving path> or it should be gone.

<Where the same symbol has a surviving consumer — name it here, explicitly, so the
agent does not delete both. "In solo, X feeds Y which stays; only the play-screen
consumer goes.">

Update `docs/flows/*` to describe the system as it now is — do not narrate the change.
```

## Review (reviewer)

One per committed wave, launched as the next wave starts.

```text
Review <commit hashes> in <repo path>. `git show <hash>` for each.

## Context
<what the commits do, in three lines, and the invariants they must hold —
visibility rules, data that must never reach a client, snapshots that must freeze>

## Focus, in priority order
1. <the highest-stakes surface — a parser fed to {@html}, a wire message, a delete>
   Try hard to break it. <Name the specific attacks worth attempting.>
2. <the next — signed URLs, snapshot moments, grading paths>
3. <...>
4. Anything that <the invariant from Context> would forbid.

## Suites
<the test files that cover the touched code — the ones to rerun>
```

Name the attacks. Without them the review returns opinions; with them it returned, in one session, an import path that bypassed validation, an image dropped on edit, arithmetic mangled by an emphasis parser, and an unbounded URL — none visible to the gate.

## Audit (auditor)

Once, after the last route item commits.

```text
Audit the UI code changed by <map> in <repo path>. Base commit: <the commit before the map's first convoy commit>.

## Files
<numbered list, one line each: path and what changed there>

## Settled decisions
<the Decision-log lines that touch these surfaces, verbatim, numbered as on the map>

## Edge cases to trace
<the specific ones this map creates — all extras vs none, a 200-char label, a note
that is entirely emphasis, a form that gained six fields>
```

## Drill (drill)

2–3 in one message, one angle each, for a judgment or experiment ticket the orchestrator resolves on the user's behalf.

```text
Judgment ticket #<n> on map #<map> in <repo path>. The map's owner is unavailable and
has delegated the call.

## Options as the ticket states them
<A, B, C — verbatim>

## Your angle
<one of: cost to reverse | what the codebase already does | what breaks at scale | what the field's best practitioner would do>
```

Different angles so the findings differ; the orchestrator judges.

## Doc sweep (sweeper)

One per doc tree, beside the wave's reviewer, when a committed wave shipped a rename or a label change.

```text
Doc sweep in <repo path>, tree: <docs/flows/ | bruno/ | UBIQUITOUS_LANGUAGE.md>.
Commit <hash> renamed these. Apply EXACTLY these pairs, whole-word, case as given:
- "<old>" → "<new>"
- ...

## Skip
<the lines the orchestrator already wrote — quoted>
```

The orchestrator gates it like any item: the grep it named, the tombstone grep, then its own commit. Sentences the sweep reports are the orchestrator's to reword.

## Locate (scout)

Before a wave, when an item's predicted file set is uncertain, or for a research ticket's "where does X happen".

```text
In <repo path>, locate: <the thing, in the words the ticket uses>.
Also try: <the other spellings the orchestrator knows — the DB column, the event name>.
```

The list comes back; the orchestrator reads the files. A scout's line is a pointer, never a finding.

## Verify (verifier)

Phase 1, before taking a recommendation: every premise it rests on that has no `@<sha>`, or whose cited paths changed since that sha (`git diff --name-only <sha>..origin/main -- <paths>`). One spawn, all such premises.

```text
Repo: <repo path>. Verify these claims:
<id> <path>:<line> — `<the literal text the premise quotes>` @<sha>
<id> <path>:<line> — <what the premise says is there>
```

A CORRECTED or REJECTED premise demotes the ticket to drill.

## The ping

For a builder that stalls without reporting — once, then gate its diff without a report:

> Report your results now — don't wait on the test run, I'll run the gate myself. Give me: files changed, <the specific facts this brief asked for>, and whether `npx biome check --write` was run. Confirm nothing is staged or committed.
