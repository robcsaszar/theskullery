---
name: ai-forge-apply
description: "HITL (Human-In-The-Loop) application of a numbered list one item at a time — status board upfront, per-item approve/skip, approve-all mode, one optional commit at the end. Use when stepping through ai-forge-judge findings or any numbered changes. Triggers are apply these, go through each one, apply improvements, commit when done. Don't use for bulk refactors, one-shot changes, or changes that don't need per-item review."
---

# AI Forge Apply (HITL)

Throw the lasso, pull it tight, move to the next. One change at a time, one approval at a time — no bundling, no skipping ahead.

**Core question for every item:** What's the smallest change that makes this finding false? Apply only that — nothing more. Verify: if any part of the change were removed, would the finding still be true? If yes, the change is too large.

## Workflow

### 1. Read the list

Parse the numbered improvement list from context. If there are multiple lists or it's unclear which to apply, ask once before starting — not mid-loop. If the response does not resolve the ambiguity, stop: "Still unclear which list to apply — please re-invoke with the target list quoted directly."

If improvements reference specific files, verify they still exist and haven't changed substantially since the evaluation. If a target file is missing or heavily modified, note it at the top of the board: "⚠ Target may be stale — <file> has changed since evaluation. Items may not apply cleanly. (c)ontinue / (Q)uit?"

If ALL items reference stale or missing targets, skip the board entirely: "⚠ All targets stale — re-run the evaluation against the current state rather than forcing through outdated findings." Then stop.

If items have dependencies (item 3 requires item 1), note the dependency at the board level. Do not re-order — apply in sequence and mark dependent items `[○]` if their prerequisite was skipped.

Settle git before the board — see **Git Workflow › Before the board**. Each git question is its own turn; the board is not shown until the last one is answered. If the working directory is not a git repo, note this at the top of the board and skip all commit steps:

```text
ℹ No git repo — changes will be applied but not committed.
```

Display the full status board upfront: all items with `[ ]` markers. Symbols: `[ ]` pending, `[✓]` done, `[→]` in progress, `[–]` skipped, `[○]` obsolete. Then ask, alone, with nothing else on the turn:

```text
(A)pprove all / (s)tart?
```

### 2. Apply each one

Repeat for every item in order:

#### a. Announce

Show `─── #N of M ───` and the full improvement description.

#### b. Apply

If the smallest change requires touching more than one logical unit (function, section, rule), the improvement is under-scoped — note this in the change summary and apply only the first unit.

Do not touch adjacent code, bundle items, or anticipate the next improvement. If applying this item overlaps with a later item (same lines, same function), apply only what's needed now and note the overlap in the change summary.

If an improvement requires non-edit actions (adding a dependency, creating a new file, running a command), describe the action in the change summary and let the user decide whether to perform it.

#### c. Show the change

```text
Changed: <file>:<lines> — <one-line description>
<concise diff summary — not the full file>
```

#### d. Ask

```text
(a)pprove, (r)evise, (s)kip, (o)bsolete, (A)ccept-all, (k)skip-all, (Q)uit?
```

Wait. Do not advance until the user responds. Any input not in the table below is a stop signal: show the current board and ask "Stop here? (y) to pause, (c)ontinue from #N?"

| Key | Mark | Advance to | Special |
|-----|------|------------|---------|
| `a` | `[✓]` | next item | — |
| `r` | — | re-apply same item | Collect one sentence — what was wrong with the change, not with the finding — then re-show. After 3 revisions: "Revised N times — skip and file a separate issue, or keep going?" |
| `s` | `[–]` | next item | Note reason if given |
| `o` | `[○]` | next item | Already done / no longer applies / impossible |
| `A` | `[✓]` each | final board | Skip per-item prompts for remaining |
| `k` | `[–]` current + all remaining | final board | — |
| `Q` | `[–]` all remaining (current unchanged) | final board | — |

**e. Update the board** — after each decision, show the current state of all items using the status symbols. For accept-all (`A`): skip intermediate board updates — apply each remaining item silently, then show the final board once in step 3.

### 3. Done

When all items are processed, show the final board and a one-liner: `HITL complete. Applied: N  Skipped: M  Revised then applied: P`

## Git Workflow

**Default: no git operations.** Commits are opt-in only — never commit unless the user explicitly requests it.

### Before the board

Check git status. If uncommitted changes exist, warn and wait — this is the whole turn:

```text
⚠ Uncommitted changes detected. (s)tash / (c)ontinue / (Q)uit?
```

Then, on its own turn, check if the user wants git integration:

```text
Git: (n)o git — just apply changes / (c)ommit when done? [default: n]
```

On `n` (or no response): skip all git operations for this session. Apply changes to working tree only.

On `c`: enable git mode. MANDATORY — READ [`references/git.md`](references/git.md) for the branch decision; it is one question per turn. Do not load it on `n`.

### After all items are processed (git mode only)

If git mode was enabled and at least one item was approved:

```text
All changes applied. Commit? (y)es / (n)o — leave staged
```

On `y`: stage and commit once. Message format: the repo's commit convention when it has one (its `AGENTS.md` or a commit-message hook) — otherwise `[-] <summary of all applied changes>` — use ticket number from branch name if available.

On `n`: leave changes staged but uncommitted.

**NEVER push automatically.** The human decides when to push.

## NEVER

- **NEVER commit unless git mode was explicitly opted into** — the default is no git operations; committing without explicit opt-in violates user trust and creates unwanted history.
- **NEVER commit after each individual item** — bundle all approved changes into one commit after the full loop completes; per-item commits create noisy git history and force the user to squash later.
- **NEVER commit or push on a non-`ai/*` branch** unless the repo's convention puts AI work on the default branch (see `references/git.md`) — otherwise AI-related changes go on a dedicated `ai/*` branch to keep work branches clean.
- **NEVER assume an existing ai/* branch is relevant** — `ai/refine-codebase-skills` is not the right branch for unrelated agent changes; always check relevance before committing there.
- **NEVER apply two improvements in one change** — if both items touch the same code, the user loses the ability to approve them independently, which defeats the purpose of the loop.
- **NEVER put two prompts in one turn** — the uncommitted-changes warning, the git opt-in, the branch question and `(A)/(s)` are four turns, not one line; a human faced with two prompts encodes two answers in one reply ("n A") and the skill has no defined parse for that. One decision per message; the next prompt waits for the answer.
- **NEVER ask clarifying questions about an improvement's intent mid-loop** — ambiguities must be resolved in step 1 before the first item.
- **NEVER let a revision loop run silently past 3 attempts** — a stuck item means the improvement is under-specified, not that the agent needs to try harder.
- **NEVER offer accept-all (`A`) before the status board has been shown** — the status board IS the plan review; once the user has seen all items listed, offering approve-all at the board level or from item #2 onwards is acceptable.
- **NEVER treat lowercase `q` as a quit signal** — only uppercase `Q` quits; lowercase `q` is keyboard-adjacent to `a` and falls through to the unknown-input stop signal.
