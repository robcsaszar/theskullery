# Remediation Workflow

Interaction protocols for Phase 5 (FAIL remediation) and Phase 6 (MANUAL-REVIEW collaboration). Loaded once remediation begins — not during scanning.

The **capability probe** lives in the SKILL.md body, not here: it runs during Phase 3 classification, before this file loads. Phase 6's **Agent boundary** line reports its result.

## Contents

- [Phase 5 protocol — FAIL remediation](#phase-5-protocol--fail-remediation)
- [Verification gate](#verification-gate)
- [Commit format](#commit-format)
- [Phase 6 protocol — MANUAL-REVIEW collaboration](#phase-6-protocol--manual-review-collaboration)
- [Report write-back](#report-write-back)

## Phase 5 protocol — FAIL remediation

Show the full board once, upfront — every FAIL with a `[ ]` marker:

```text
| # | Finding | Status |
|---|---------|--------|
| 1 | Missing CSP / security headers | [ ] |
| 2 | Unsalted password hash | [ ] |
```

Symbols: `[ ]` pending, `[✓]` fixed, `[→]` in progress, `[–]` dismissed, `[!]` blocked (needs infra/decision).

Then offer: `(s)tart per-item / (A)pply all / (Q)uit`.

Per item, in order:

1. **Announce** — `─── #N of M ───` plus the finding's file:line, risk, and proposed fix.
2. **Flag prerequisites first.** If the fix needs a new env var, DB table, dependency, or breaks an existing deployment, say so *before* applying — those are the items where "approve" means something different than "edit a file."
3. **Apply** the smallest change that makes the finding false.
4. **Verify** — run the verification gate below.
5. **Show the diff** for this finding alone, so the answer is given against what actually changed.
6. **Ask** — `(a)pprove / (r)evise / (s)kip / (A)pply-all / (Q)uit`.
7. **Commit on approval only** — one commit, this finding only. `(r)evise` re-applies and re-asks; `(s)kip` reverts the working-tree change. Neither leaves a commit behind.
8. **Update the board** and write back to the report file.

Verify before asking, commit after answering. Verification tells the human whether the fix holds, so it has to precede their decision; the commit records a decision that has already been made, so it has to follow it.

Uppercase `Q`/`A` only for quit/apply-all; lowercase `q` is adjacent to `a` on the keyboard and should fall through to a stop-and-confirm.

## Verification gate

After every applied fix, run the project's own verification command — the one its docs or `AGENTS.md`/`CLAUDE.md` name as the definition of done (commonly type-check then build; tests where they exist).

If it fails: revert or repair *before* marking the item `[✓]` and before committing. A fix that doesn't compile is not a fix, and stacking the next fix on a broken tree makes the failure hard to attribute.

If no verification command exists, say so once and mark subsequent fixes as unverified in the report rather than implying they were checked.

### A green build is not sufficient for runtime-behavior fixes

Security fixes disproportionately change what happens *at request time*, and a type-check and build both pass with flying colours on a policy that breaks every page in production. Compile-time verification cannot see a runtime regression.

When a fix touches any of these, exercise a real request before marking it `[✓]`:

| Fix touches | Failure a build won't catch | Verify by |
|---|---|---|
| Response headers / CSP | Policy blocks the app's own scripts, styles, or fonts; page renders blank or unhydrated | Fetch a rendered page; inspect the header *and* confirm the markup it governs still executes |
| Auth, sessions, cookies | Everyone is logged out, or nobody can log in | Complete one real login and one authenticated request |
| Middleware / hooks | Applies to routes it shouldn't, or misses routes it should | Hit one affected and one unaffected route |
| Rate limiting | Limit fires on the first request, or never fires | Send N+1 requests and confirm where it trips |
| DB schema or query changes | Missing table/column at runtime; query returns nothing | Run the query against the real database |

Framework-managed policies are the classic trap: setting a header by hand that the framework also wants to manage produces a valid build and a broken site, because the framework's own injected content no longer satisfies the policy. Prefer the framework's native configuration for anything it already knows how to emit.

If a fix can't be exercised locally (needs production credentials or deployed infrastructure), say so plainly, mark it verified-by-build-only in the report, and tell the user what to check after deploy. Do not let it pass as fully verified.

## Commit format

One commit per approved finding — a bad fix stays revertible in isolation, which a bundled security commit does not.

```text
security: <what changed, imperative>

<why it was a problem, 2-4 lines>
Fixes #N from <report path>.

<BREAKING: any required infra/env change, if applicable>
```

Call out breaking changes loudly — a password-hash format change or a new required table will take production down at deploy time if the operator doesn't know to act first.

## Phase 6 protocol — MANUAL-REVIEW collaboration

One item at a time — these need the user's hands or judgment, so batching them guarantees some get skimmed.

For each, present a standardized block:

```text
### [N]. <Category>
**Where:** <exact navigation path — dashboard → section → setting, CLI command, or file>
**Steps:**
  1. <numbered, specific>
  2. ...
**What good looks like:** <the expected value/state, so "checked it" is verifiable>
**Agent boundary:** <what I can do vs. what only you can do — from the capability probe>
```

**Where** is the field that fails most often. "Check your Turso backup settings" is not navigation; "Turso dashboard → your org → the database → Settings → Point-in-Time Recovery" is. If the exact path isn't known, say which product area to look in and that the UI may have moved — don't invent a menu tree.

Then capture disposition: `(c)onfirmed-already-correct / (f)ixed-just-now / (a)ccepted-as-is / (d)eferred`, and for accepted/deferred record the user's stated reason. An accepted risk with a rationale is a decision; an accepted risk without one is an oversight wearing a checkmark.

When the user answers with a constraint rather than a fix ("it's a free account, 1 day retention"), record it as accepted-with-limitation and note the residual exposure in one line. Don't push an upgrade they didn't ask about.

## Report write-back

The report file is the deliverable, so it must not go stale the moment remediation starts.

After each item resolves, update its row in the summary table: `FAIL` → `FIXED` / `DISMISSED` / `BLOCKED`, `MANUAL-REVIEW` → `CONFIRMED` / `FIXED` / `ACCEPTED` / `DEFERRED`. Append the disposition (and reason, where given) to that finding's block.

At the end, add a short disposition summary at the top of the file: counts by outcome, plus any outstanding operator actions required before deploy. Someone reading the file cold a month later should learn what was decided, not just what was found.
