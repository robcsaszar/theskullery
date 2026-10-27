---
name: convoy
description: "Sails a whole meridian map to done, resumable across sessions — waves of parallel subagents under one orchestrator that owns every gate and commit. Use whenever the user wants a map worked end to end without stopping — work the whole map end to end, sail the whole route, ship the entire map, do every ticket, run it all unattended, convoy this. With the user away, convoy also resolves open judgment tickets and charts a missing route on their behalf; with the user present a missing route goes back to meridian first. Don't use for one ticket at a time (transit), charting a map or spec (meridian), scan-driven single fixes (tend-*), or ad-hoc coding with no map behind it."
argument-hint: "[map number]"
hooks:
  PreToolUse:
    - matcher: "Agent"
      hooks:
        - type: command
          command: "bash \"${CLAUDE_PROJECT_DIR}/.claude/skills/convoy/scripts/guard-agent.sh\""
---

# Convoy

One escort, many vessels, one route. The orchestrator is the escort — it briefs, gates, commits, and judges; it never accepts a vessel's word for where it has been. Subagents implement, review, and audit; they never commit and never wait on the gate.

Sibling to **meridian** (charts) and **transit** (one crossing). A convoy takes the map from wherever charting left it to route-complete. GitHub-issues workspace only — the commands below assume it.

## Ownership

Every uncommitted file has exactly one owner — user, orchestrator, wave-hub, or an agent — and the orchestrator knows who before any agent runs. MANDATORY READ [`references/ownership.md`](references/ownership.md) at wave assembly (Phase 2) and whenever a path in `git status` has no claimant.

## Phase 0 — Bearings

Resolve the map from the argument; none or several match → list them and stop. Load the map body. Read the repo's delegation guidance if it has one (`docs/agents/delegation.md` here); without one, `references/briefs.md` carries the whole briefing standard. Confirm the branch is `main`, otherwise stop — a convoy commits on the default branch only, because the trailers below close tickets on push and a push from a feature branch would tick items whose tickets stay open. Record the baseline per [`references/gate.md`](references/gate.md) § Baseline — the lint warning count and the failing test ids of all four suites, with the commit they ran at.

Snapshot `git status --porcelain` — the user's paths. Reconcile every open route item: `git log --grep "Closes #<n>\b"`; on a hit, `git merge-base --is-ancestor <sha> origin/main` — true means the user reopened it, so it is work; false means **committed, unpushed**, so it is done.

Open the **log**: `.claude/log/<map>/` with `briefs/`, `reports/`, and `DECISIONS.md` seeded from the map's Decision log (one numbered entry per line: chose · rejected · why · reverses). It is gitignored and holds what the map should not — the exact words each agent was given and gave back. Resuming: a brief in `briefs/` with no report in `reports/` is an agent whose result is **UNKNOWN**, not "nothing found" — its item is work until gated.

Completion: one map, `main`, baseline, user paths, committed-unpushed items, and the log folder all recorded.

## Phase 1 — Clear the frontier

The frontier is every open, unblocked ticket. Research tickets get `scout` agents for locations and the orchestrator's own reading for the answer (as meridian). Judgment and experiment tickets are HITL by label — in a convoy the orchestrator stands in for the user; the user invoked convoy knowing that. Pick by predicate:

- Judgment or experiment whose ticket body carries a recommendation, with no killed alternative on the same question in Ruled out, **and** not marked one-way, **and** whose stated premises still hold on current `main` (transit gate 7 — a premise cited `@<sha>` stands when nothing it cites changed since; the rest go to one `verifier` per [`references/briefs.md`](references/briefs.md) § Verify) → **take the recommendation**. Record it on the ticket with the accepted weakness named. A premise that no longer holds demotes the ticket to drill.
- Judgment or experiment that weighs two or more options, names a real trade-off, or is marked one-way → **drill it**. MANDATORY READ [`references/briefs.md`](references/briefs.md) § Drill; spawn 2–3 `drill` agents in one message, one angle each. Judge as orchestrator; do not average. Resolve with the decision, the strongest objection it survived, and which drill raised it.
- Task labelled `mode:agent` → it joins wave 1 alongside route items.
- Task labelled `mode:human` (tasks only — a judgment never carries it, see NEVER) → the orchestrator cannot clear it. With the user present at invocation, put every such task that blocks a route item to them in one message before wave 1, each in the Phase 6a format (`references/closeout.md`) — an answered one is cleared now. Otherwise, or unanswered: record it as an open blocker, exclude every item it blocks from the graph, list them as still open in Phase 6.

Record resolutions per the tracker doc's *Resolve and close* and the Decision log. No Route → with the user present, stop and hand to meridian's route session — seams and the quiz are theirs to answer — and resume the convoy once the route exists; this is not halting on a ticket, it is the one checkpoint built for a person. AFK (a schedule, a workflow, or the invocation said so) → chart one per `.claude/skills/meridian/references/route.md` by recommendation, say so in the log, and label every item whose criteria name a rendered surface `mode:human` so the walkthrough (Phase 5b) reaches a person.

Completion: no open judgment, experiment, or research ticket; every route item exists with wired blockers.

## Phase 2 — Waves

A **wave** is every item whose blockers are closed **and** whose predicted set is disjoint from every other item in the wave; the smaller of two colliding items waits. If `HEAD` moved since the last convoy commit, re-take the baseline and the user snapshot first, and note the foreign commits for Phase 6.

Per item, MANDATORY READ [`references/briefs.md`](references/briefs.md) § Implement — or § Delete when the work is removal — and spawn a `builder`; load only the section named. Launch the whole wave in one message. While it runs, the orchestrator writes nothing outside orchestrator-owned paths.

An agent that stops without reporting gets one ping, with § The ping's text; a second stall means read its diff and gate it without a report. An agent that reports **"this needs a choice"** has found a judgment ticket: file it, resolve it by the Phase 1 predicate, log it, revert the item, re-queue it next wave.

Completion: every agent in the wave has reported.

## Phase 3 — Gate and commit

Gate each agent **as it reports** — wave membership already proves its blockers closed, so no order within a wave. The full suite runs once per wave and once after the audit; a review-fix commit under thirty lines runs only the suites its files name. Verify — read the actual diff, run the repo's full gate (typecheck, lint, tests), check every acceptance criterion against a command you ran — a test name, a grep, a shot — never the agent's own MET line, stage exactly that item's files — then commit. MANDATORY READ [`references/gate.md`](references/gate.md) § Checklist before the first gate of every wave and § Line endings before every stage: each item there is the smallest thing that has shipped wrong here.

Completion: every reported item committed with its trailer, ticket open, or reverted with the failure commented and re-queued.

## Phase 4 — Review in parallel

When a wave is committed and the next launched — and once more after the last wave, before Phase 5 — spawn one `reviewer` — MANDATORY READ [`references/briefs.md`](references/briefs.md) § Review — over the wave's commits **plus every fix commit since the previous review**. Commits, never the tree: the tree holds other agents' half-applied edits.

CONFIRMED findings: re-confirm against `HEAD` first — an earlier fix may have moved the line. Under thirty lines across one or two files, fix yourself; larger, brief a `builder` with the finding as spec. Files a running agent owns wait. A fix to the brief's first Focus line — the highest-stakes surface — also needs a test asserting the reported attack — written first and seen failing before the fix, the red run named in the fix commit's message — or a `reviewer` over the fix commit; the gate cannot see a partial escape. PLAUSIBLE findings get one look, then fog. A reviewer's label — nit, hygiene, cosmetic, pre-existing — exempts nothing: every finding ends fixed, ticketed, or in Fog with the reason, whatever the reviewer called it. A ticketed finding outside the map's scope — a failure the baseline already carried, a bug in code no item touches — is a `meridian:task` with `mode:agent` as a sub-issue of the map, never an unlabelled issue: the frontier query finds it, nothing finds a bare issue.

A wave that shipped a rename or a label change also spawns a `sweeper` beside the reviewer — MANDATORY READ [`references/briefs.md`](references/briefs.md) § Doc sweep — one per doc tree, with the exact pairs. Two reviews in one run caught doc lines the orchestrator's own sed missed.

Fixes go through Phase 3, each its own commit.

Completion: every CONFIRMED finding fixed and committed, or on the map with the reason.

## Phase 5 — Interface audit

After the last route item commits, one `auditor` over every touched surface — MANDATORY READ [`references/briefs.md`](references/briefs.md) § Audit, which carries the Decision-log lines for those surfaces; the agent preloads the `interface` skill itself. Per-item checks miss what only a cross-surface view sees: the same content rendered six ways. A finding that contradicts a logged decision is declined, quoting the decision-log line verbatim as the reason, or filed as a judgment ticket — never applied. The code follows the log line, not the finding's reading of it: "declined" means the finding, never the decision.

Apply the rest as § Implement briefs partitioned by file. Gate, commit.

Completion: findings applied, declined with a reason, or ticketed.

## Phase 5b – 6b — Walkthrough, report, close-out

After the audit: drive every rendered surface and attach a capture or file a `mode:human` visual-check ticket; update the map and report; walk every human task one at a time; tick by ancestry, ticket every convoy-authored fog line, close children and the map. Push nothing unless the invocation asked. MANDATORY READ [`references/closeout.md`](references/closeout.md) when Phase 5 completes.

## Rules

- **Roster only.** Every spawn is one of `scout`, `builder`, `reviewer`, `auditor`, `sweeper`, `drill`, `verifier` from `.claude/agents/` — model, effort, tools, and standing rules are pinned there, so a brief carries only the item. The frontmatter hook blocks any other `subagent_type` for the session, because a `general-purpose` spawn inherits the session model, the session effort, and every tool including `Agent` — one forgotten `model:` is an opus builder that can spawn opus builders. A task none of them fits is the orchestrator's own.
- **Brief before spawn, on disk, read-only.** Write `briefs/NN-<agent>-<item>.md` (NN global per map, two digits), then `attrib +R` / `chmod a-w` it; the Agent prompt is "Read and execute `<path>`". A scope change is a new brief, never an edit — the reviewer grades against the words the builder got. On return, save the report verbatim to `reports/NN.md` before reading it for the gate.
- **DECISIONS.md is the loop-breaker.** Every Phase 1 resolution, every declined audit finding, every Phase 4 "fix" that changes a settled shape appends an entry. A fix that would reverse an entry is a judgment ticket, not a fix. Two reversals of one question → stop, file the ticket with both reasons, leave the item open.
- **Read-only agents are checked, not trusted.** `git status --porcelain -uall` before and after every `reviewer`, `auditor`, `drill`, `verifier`, or `scout`; a difference means it wrote — discard its verdict, attribute the paths at the next gate, spawn again.
- No worktrees per agent and never `git stash` — stash is repo-wide across worktrees and has destroyed another session's work here before.
- Context near its limit → gate the current wave, run Phase 6 on what shipped, stop. Phase 0 reconciliation finds it next time.

## NEVER

- **NEVER halt the route on an open judgment ticket**
  **Instead:** Phase 1 — take the recommendation or drill it, record the resolution, proceed.
  **Why:** A convoy is invoked so the user can leave. Halting reproduces transit's one-crossing behaviour and ships one item of ten, which the user will find on return.

- **NEVER label a judgment `mode:human`**
  **Instead:** Take the recommendation or drill it. A drill that leaves two options balanced still decides — record the tie-breaker it chose and the objection it survived; the doubt goes to Fog. `mode:human` is for work that needs hands or access: a screen only eyes can check, a path the sandbox cannot write, a secret.
  **Why:** Phase 6a would otherwise become the place decisions go to wait, which is transit's one-crossing behaviour by another door.

- **NEVER let an agent run the full suite before reporting**
  **Instead:** Brief it to run only the tests it touched, then report; the orchestrator gates.
  **Why:** An agent that backgrounds `pnpm test` stops with "waiting for the test run" and needs a ping every time. The suite runs once, at the gate, not once per agent.

- **NEVER call a map shipped before its rendered surfaces have been seen**
  **Instead:** Phase 5b — a capture on each rendered item's ticket, or a visual-check ticket for a person; the shipped line comes after.
  **Why:** Unit tests and CSS arithmetic pass on pages nobody can use. The one map reported shipped on tests alone came back with nine defects from a single play.

- **NEVER absorb a surfaced gap into the current item**
  **Instead:** File it as a route item on the map, blocked by nothing, with the decision it serves.
  **Why:** Absorbed scope has no acceptance criteria and no ticket to close; silently skipped scope is worse. A ticket keeps the map honest either way.
