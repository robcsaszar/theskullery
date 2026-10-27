---
name: crucible
description: "Targeted multi-domain codebase audit. Use when auditing a user flow end to end, investigating issues that span several domains (auth, data, API, UI), or running a structured find-then-fix cycle over a named area. Produces a validated findings set and a SPEC handoff for implementation. Not for reviewing a single file or diff — that's code-review — or for fixing a bug whose cause is already known."
disable-model-invocation: true
---

# Crucible

Parallel domain recon → adversarial kill → plan → verify → SPEC → implement → PR.

## File Ownership Rule

**Subagents NEVER write files.** They return results as text. You (the orchestrator) write every artifact. Files are the cross-phase handoff — subagent memory is not. Recon agents are `Explore` agents — no Edit or Write — but Bash can still write, so the rule is checked: snapshot `git status --porcelain -uall` once before the parallel launch and once after all return. Any difference → discard all recon output and rerun the domains one at a time, with the check around each.

## Setup

Parse the invocation for:

- **Domains** (required) — user-facing areas to audit, e.g. `player`, `curator`
- **Scope hint** (optional) — narrow focus within a domain, e.g. `lobby reconnect`, `role selection`

Determine output directory: `.crucible/run-<N>/` where N is the next unused integer.

**Prior-run check**: scan `.crucible/` for existing run directories. Read each `findings.json`. Feed `id — title — files[0].path` for each prior confirmed finding as a skip list into Phase 1 agents — IDs restart every run, so an ID alone names nothing — don't re-discover known fixed issues; weight effort toward gaps.

Files written this run (all by orchestrator):

| File | Phase | Role |
|------|-------|------|
| `codebase-map.md` | 1 | Context injected verbatim into all downstream agents |
| `recon-<domain>.json` | 1 | Per-domain raw findings |
| `findings.json` | 1→2→4 | Merged findings; verdicts appended each phase |
| `PLAN.md` | 3 | Prioritized fix plan |
| `SPEC.md` | 5 | Before/after code + test cases per finding |

## Phase 1 — Recon

MANDATORY READ [`references/recon-phase.md`](references/recon-phase.md) before launching agents.

Launch one `Explore` agent with `model: sonnet` per declared domain, all in parallel. Feed each: codebase path, domain name, scope hint (if any), the prior-run skip list.

Agents return a JSON object, `{"checked": [...], "findings": [...]}`. Prose instead → re-prompt once with the exact shape from `references/recon-phase.md`. Fails again → write `recon-<domain>.json` as `[]` and record the domain as **FAILED** in `codebase-map.md`. Continue — one failed domain is recoverable; do not abort the run. A FAILED domain is unaudited, never clean.

Collect valid responses, then:

1. Write `recon-<domain>.json` per agent response — its `findings` array
2. Synthesize `codebase-map.md` — key file paths, domain boundaries, shared modules, conventions, each domain's `checked` list, and every FAILED domain
3. Merge all domain findings into `findings.json`, adding `verdict: "confirmed"` to each — the schema's discriminator

Completion criterion: every domain has a `recon-<domain>.json`, `codebase-map.md` written, `findings.json` written. Do NOT load `references/adversarial-phase.md` until Phase 2.

## Phase 2 — Adversarial Review

MANDATORY READ [`references/adversarial-phase.md`](references/adversarial-phase.md) before launching agents.

Spawn one `refuter` per batch of at most six findings from one domain, all in parallel — a batch that size fits one run. Each gets that domain's findings as claims and `codebase-map.md` — NOT the recon agent's reasoning. Independence boundary is the quality gate.

The refuter returns SURVIVED / REJECTED / DOWNGRADED per finding. Write each into `findings.json`: SURVIVED → `adversarial_verdict: "confirmed"`; DOWNGRADED → `"downgraded"` and the new severity; REJECTED → replace the entry with `{verdict: "rejected", id, domain, title, reason}`, its evidence as `reason`. Its ATTACKED, STRONGEST OBJECTION, and COULD NOT EXAMINE lines go into `adversarial_notes`; a refuter that returns no report is spawned again with its batch split in two. Run `node .claude/skills/crucible/scripts/validate-findings.cjs .crucible/run-<N>/findings.json` — fix any schema errors before Phase 3.

**When the validator itself can't run** — `node` not on PATH, the script or its schema missing, a usage error, or any failure before validation begins (`Failed to load schema`, `Failed to parse JSON`) — this is not a pass. Note `⚠ findings unvalidated — validator unavailable: <reason>` in the findings output and at the top of the SPEC handoff, then continue. A schema *rejection* is the opposite case and always blocks: fix the findings, re-run, do not proceed on a rejection. Both currently exit `1`, so read the error text, not the exit code.

Completion criterion: every finding has an `adversarial_verdict` field or is rejected. Schema validation passes. Do NOT reload `references/recon-phase.md` from this point forward.

## Phase 3 — Plan Synthesis

**Zero-findings check**: before synthesizing, count confirmed + downgraded entries in `findings.json`. If zero, write `.crucible/run-<N>/REPORT.md` with one line — "No actionable findings after adversarial review." when every domain ran, or "<n> of <m> domains FAILED recon (<names>) — not a clean result." when any did not. Stop — do not open a PR.

Synthesize confirmed + downgraded findings from `findings.json` into `PLAN.md`:

- **P1 (critical/high)**: broken core flows, data loss, permanent disconnection
- **P2 (medium)**: user-visible errors, missing recovery paths
- **P3 (low)**: polish, doc drift, copy issues

Group findings that share a root cause — one fix may eliminate several. When grouping: the highest severity among the grouped findings sets the group's priority. If grouped findings have conflicting fix approaches, split them — shared root cause does not require a shared fix. Declare fix order where dependencies exist. Rejected findings excluded entirely.

Completion criterion: `PLAN.md` written; every confirmed finding appears exactly once.

## Phase 4 — Independent Verification

Spawn one `verifier` over the literal claims of every confirmed finding, P3 included — PATH and LINE from `files`, the `quote` as literal text, SCOPE as the component name `root_cause` cites. It returns VERIFIED / CORRECTED / REJECTED / UNSURE per claim. VERIFIED → `verification: "verified"`; CORRECTED → apply the correction, `"corrected"`; REJECTED → replace the entry with `{verdict: "rejected", id, domain, title, reason}`; UNSURE → read its candidates yourself and settle it as one of the three.

The PATTERN check — does the pattern `fix_approach` describes still appear in the current code — is your own read per P1 + P2 finding: it is interpretation, which the verifier does not do.

Apply all corrections to `PLAN.md` and `findings.json`. Run schema validation again. `PLAN.md` and `findings.json` must agree — no disagreement between deliverables.

Completion criterion: every confirmed finding verified or corrected. All corrections applied. Schema passes.

## Phase 5 — SPEC

Write `SPEC.md` with one section per confirmed finding (P1 → P2 → P3 order):

- Exact file path + line range (verified)
- Before code (real source, not pseudocode)
- After code (concrete fix)
- Test cases: one sentence per behavior the test must verify, and the defect it catches — it fails on the Before code because <reason>

Run `node .claude/skills/crucible/scripts/validate-findings.cjs .crucible/run-<N>/findings.json --pre-spec` as the final check.

Completion criterion: every PLAN.md entry has a SPEC section. Validation passes.

## Phase 6 — Handoff

1. `git switch -c fix/crucible-run-<N>` before the first commit; `.crucible/run-<N>/` goes into that first commit, so the PR's links to `PLAN.md` and `SPEC.md` resolve and the next run's prior-run check finds it
2. Update flow docs (`docs/flows/`) for any finding that changes a user-facing behaviour
3. Implement `SPEC.md`, one group of findings at a time: brief a `builder` — shape from `.claude/skills/convoy/references/briefs.md` § Implement, with its issue line replaced by `Implement finding <id> from .crucible/run-<N>/SPEC.md § <id>; there is no ticket — skip reading one`, the SPEC section as **The change**, its test cases as **Tests**, the other groups' files as Off-limits, the brief written under `.crucible/run-<N>/briefs/` — or, for a change of ≤30 lines across 1–2 files, implement it in-session. Gate and commit each group per `docs/agents/delegation.md` § "Verify, then commit" before briefing the next: groups share one tree, so a parallel builder's half-applied edit would sit inside another group's gate
4. Open a PR — this is the HITL gate; no intermediate approval is requested

PR body: link to `PLAN.md`, finding count by severity, link to `SPEC.md`, list of flow docs updated, and the run's counts — findings the refuter rejected or downgraded, claims the verifier corrected, domains FAILED.

## NEVER

- **NEVER ask a subagent to write a file**
  **Instead:** Have the agent return the content as text; write the file yourself.
  **Why:** Cross-phase state lives in files. If an agent writes directly, the orchestrator loses the canonical copy and cannot reconcile deliverables after Phase 4 corrections.

- **NEVER give an adversarial agent the recon agent's chain of reasoning**
  **Instead:** Pass only the structured finding (JSON) and `codebase-map.md`.
  **Why:** Seeing the recon agent's logic anchors the adversarial agent to the same assumptions — the independence boundary is what kills false positives.

- **NEVER proceed past Phase 2 with schema validation failures**
  **Instead:** Fix the failing fields in `findings.json` before synthesizing the plan.
  **Why:** A PLAN built on malformed findings produces a SPEC with wrong file paths and line numbers that the builder cannot use.

- **NEVER write `SPEC.md` while any confirmed finding has `verification: "pending"`**
  **Instead:** Run `node .claude/skills/crucible/scripts/validate-findings.cjs .crucible/run-<N>/findings.json --pre-spec` and resolve all failures before Phase 5.
  **Why:** The `--pre-spec` guard exists in the validator script but is invisible unless invoked — an agent that skips this call will SPEC unverified file paths and silently pass wrong line numbers to the builder.
