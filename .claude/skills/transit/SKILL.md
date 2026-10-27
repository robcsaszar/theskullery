---
name: transit
description: "Works one ticket on a meridian planning map — resolves it by its meridian label (judgment, research, experiment, task, or route) and records the outcome on the map, whether the map is a plans/ file or an issue on GitHub or Jira. Two modes — HITL when a person invokes it with a ticket or map, AFK when a schedule, workflow, or Routine fires it, where only research tickets and items labelled mode:agent with closed blockers are eligible. Use whenever the user names a plan ticket or route item to work, or says next ticket, work the frontier, take the first move, or an unattended run says transit. Prefers the repo's delve, prototype, and tdd skills and its reviewer agent when installed and carries a fallback for each. Don't use for charting a map, spec, or route (meridian), a whole map end to end without stopping (convoy), scan-driven one-fix runs (tend-*), or ad-hoc coding with no ticket behind it."
argument-hint: "[ticket or map number] [--afk]"
---

# Transit

A transit is one crossing of the meridian: one ticket, claimed, resolved by its label, recorded on the map, released. Never two crossings in one run.

## Phase 0 — Mode and workspace

1. **Mode.** HITL unless the invocation carries `--afk` or the run is unattended — a schedule, workflow, or Routine prompt says so. AFK never asks a person anything; a question it cannot avoid ends the run through the release step in Phase 3.
2. **Workspace.** Read the `## Planning` section of `CONTEXT.md`, else `AGENTS.md`, for the tracker and the map query. None → `local-markdown`: the map is a `plans/<slug>.md` file and no tracker is assumed from repo signals. Then **MANDATORY READ** `.claude/skills/meridian/references/trackers/<tracker>.md` — every tracker operation below (claim, frontier query, blocking, resolve, close, graduate fog) is done its way, never improvised. File missing → stop: transit works meridian maps only, and meridian is not installed.
3. **Map.** Load the map body only — Destination, Bearings, Decision log, Route — never every ticket. On local-markdown the file is the body and its Frontier table is the ticket list. Load every skill named on the map's Bearings → Consult line. Run `node .claude/skills/meridian/scripts/validate-map.mjs map <file or ->` on it, and `item -` on a claimed route item's body in Phase 1; carry any ERROR or WARN lines into the run's comment — they never block a transit.

Completion criterion: mode, tracker doc, and map body are in context.

## Phase 1 — Choose and claim

Run the gate top-down on a candidate; the first failed row rejects it.

| # | Gate | HITL | AFK |
|---|---|---|---|
| 1 | Open child of the map with exactly one `meridian:` label | ✓ | ✓ |
| 2 | Unclaimed — no assignee | ✓ | ✓ |
| 3 | Every blocker closed. Native dependencies first; if the tool at hand cannot read them, use `Blocked by:` body lines plus the map's Route order, and say which you used | ✓ | ✓ |
| 4 | Not already covered by an open PR or a `transit/*` branch | ✓ | ✓ |
| 5 | Label is `meridian:scout`, or `meridian:task` / `meridian:slice` carrying `mode:agent` | — | ✓ |
| 6 | Open `transit/*` PRs below the cap — `TRANSIT_PR_CAP`, default 2 — route items only | — | ✓ |
| 7 | The ticket's stated facts still hold on current `main`, and every fact a question will rest on is checked before the question is sent — never after the answer | ✓ | ✓ |

On local-markdown the gate reads the file: a ticket is a Frontier row or a Route line; its label is the Type column or the Route list; the claim is the Claimed by column; blockers are the Blocked by column; mode is the `[agent]` / `[human]` marker, research rows counting as AFK. Every map write — claim, resolution, log line, Route tick — is a commit on the run's `transit/<slug>` branch, carried by its PR; gate 4 is the concurrency guard.

Gate 7's method: a fact cited `@<sha>` stands when `git diff --name-only <sha>..origin/main -- <its paths>` prints nothing. Every moved or sha-less fact goes to one `verifier` spawn, all such facts together, before any question is sent.

Candidates come from two queries, both the tracker doc's way: its frontier query for decision tickets, and the same query with the type labels replaced by `meridian:slice` for route items — the doc's frontier query omits route items by design. On local-markdown, route items are the map's Route list.

Gates 4 and 6 use one read of open PRs — `gh pr list --state open --json number,headRefName,body` (Jira or local: the repo's git remote) — plus `git ls-remote --heads origin 'transit/*'`. A ticket is covered when a PR body contains `Closes #<n>` or a head `transit/*` branch names its slug. The cap count is the number of open PRs whose head starts with `transit/` — the same filter `assets/transit-run.yml` uses — compared to `TRANSIT_PR_CAP`, default 2.

Selection: the ticket the user named; otherwise decision tickets before route items, taking the frontier ticket that unblocks the most, and route items in the map's Route order. Nothing passes → say so and stop; in AFK, stop with no comment and no write — except the gate-1 label case in HITL, which asks (Error handling).

**Claim** by assignee before any other write — concurrent sessions filter on assignee; an unclaimed ticket gets worked twice and closed once. A `mode:human` item in HITL proceeds — the human is present; in AFK gate 5 already rejected it.

Completion criterion: exactly one ticket passed every gate and carries the claim.

## Phase 2 — Resolve by label

MANDATORY READ [`references/dispatch.md`](references/dispatch.md), only the section for this ticket's label. Each recipe names a **preferred skill** and a **fallback**: if `.claude/skills/<skill>/SKILL.md` exists, read it and follow it — load the sibling's own references only where its MANDATORY line fires; otherwise follow the fallback in the recipe. Never run both.

| Label | Mode | Recipe | Preferred skill |
|---|---|---|---|
| `meridian:scout` | AFK | a researcher reads the primary sources, returns cited findings | `delve` |
| `meridian:decision` | HITL | grilling rounds; glossary sharpened as terms land | none — folded into the recipe |
| `meridian:prototype` | HITL | throwaway prototype the user reacts to | `prototype` |
| `meridian:task` | declared | do it, or walk the human through it step by step | none |
| `meridian:slice` | declared | implement the slice at its seams, review, PR | `tdd`, `reviewer` agent |

Judgment and experiment tickets never reach this phase in AFK — gate 5 keeps them out. A research ticket named in HITL still resolves by a researcher; the Mode column says who may take a ticket, not who runs it.

Completion criterion: the recipe's own completion line is met — an answer with evidence, a decision in the user's words, a user reaction to an artifact, a done task with its resulting facts, or a green branch whose diff reads as if the system had always been this way, ready for a PR.

## Phase 3 — Record, ripple, release

**Decision tickets** — judgment, research, experiment, task — in this order:

1. Resolution comment on the ticket: the answer; the evidence — cited paths as `path:line @<short sha>` read at — or the user's words; options killed for cause with their reasons. A research finding that implies a decision becomes a new `meridian:decision` ticket carrying your recommendation and its main weakness — never the decision itself. Test: could two competent people read the same evidence and reasonably act differently? No → the fact goes in the log line only. Yes, and the answer changes what gets built or what a user sees → judgment ticket. Yes, but it changes neither → decide it; the log line reads Via I, with the reason and what would make it wrong. A defect found outside the ticket's scope is a `meridian:task` with `mode:agent` under the map, never an unlabelled issue.
2. Close as completed. An experiment deferred to a spike stays open marked deferred, and the spike is created as a `meridian:slice` item.
3. One Decision log line on the map: ticket name, linked — gist — Via.
4. Ripple: newly surfaced decisions → tickets, create then wire; fog the answer made statable → a ticket, and the line leaves Fog; a ticket now beyond the Destination — its answer would change no Route item that serves the Destination sentence → closed as not planned plus one Ruled out line; tickets the answer invalidated → updated or closed with a one-line reason, never orphaned.

**Route items:**

1. Branch `transit/<slug>` from `main`; commits follow the repo's AGENTS.md conventions.
2. PR body: the ticket's acceptance list with every box ticked and its evidence beside it — grep output, test name, screenshot, from a command the session ran, never a builder's own MET line — then `Closes #<n>` — on local-markdown, the route item's name and the map path instead — then every assumption made without a human, internal choices included, each with its reason. The ticket stays open; the merge closes it — a hand-closed item with an unmerged PR reads as shipped to every session that follows.
3. Comment the PR link on the ticket. Leave the map's Route checkbox alone for now.

**Map upkeep, every run:** tick Route items whose ticket is closed — on local-markdown, whose PR is merged; mark the map done when all are.

**Release:** a run whose ticket is unresolved unassigns it and comments where it stopped and why — in AFK, including the question it could not answer. Name the next frontier ticket. Stop.

Completion criterion: the ticket is closed with a log line, or open with a PR link, or released with a stop comment. Never claimed and silent.

## Spawning

- Roles with a pinned model, effort, and tool list live in `.claude/agents/` — `scout` (locations), `builder` (a briefed slice), `reviewer` (committed hashes), `verifier` (gate 7 premises). Spawn them by `subagent_type`; a research subagent has no role file and is spawned `general-purpose` with `model: sonnet` set explicitly, because an unset model inherits the session's.
- Every spawn's brief is written to `.claude/log/<ticket-slug>/briefs/NN-<agent>.md` before the call and its report saved to `reports/NN.md` on return — a brief with no report is an UNKNOWN result, not a clean one. The folder is gitignored.
- `git status --porcelain -uall` before and after a `scout`, `verifier`, or `reviewer`; a difference means it wrote, and its output is discarded.

## Scheduling

`assets/transit-run.yml` is a GitHub Actions wrapper — cron plus `workflow_dispatch`, one AFK transit per run, the PR cap enforced by a shell step before the model starts. Copy it into `.github/workflows/` and commit it only when the user asks; unattended writes to a shared tracker are never opted into silently. A Claude Routine works the same way: fresh session per fire, prompt "run one transit in AFK mode on the map matching the Planning section's query". Do not read `assets/transit-run.yml` or `evals/` during a run — the yml is copied, never followed; evals are for `ai-forge-eval`.

## Error handling

- Tracker doc unreadable mid-run → stop before any write; report the path.
- The repo's checks red on a route item, or the cap reached → no PR; comment the state on the ticket; release — unreviewed PR floods are how the previous unattended roster died.
- Preferred skill file present but unreadable → use the fallback recipe and say so in the resolution.
- The user-named ticket fails gate 1 (two `meridian:` labels or none) → HITL names the conflict, asks which label to keep, fixes the label, then re-runs the gate; AFK skips it and picks the next candidate.

## NEVER

- **NEVER read the invocation prompt as the go for a route item in AFK mode**
  **Instead:** Gate 5 — `mode:agent` plus closed blockers is the only go.
  **Why:** A baseline run treated "work the next ticket" as permission to implement an unlabelled route item. The label is what a person set; the prompt is what a cron wrote.

- **NEVER answer a judgment question, or react to a prototype, on the user's behalf**
  **Instead:** HITL asks and waits; AFK never selects those labels; a finding that needs a decision becomes a judgment ticket.
  **Why:** A decision the agent made reads on the map exactly like one the user made, and every later ticket builds on it.

- **NEVER send a question whose premise you have not checked**
  **Instead:** Scout first, then ask; a premise found wrong after the answer re-opens the question with the correction stated first.
  **Why:** An approval given on a false premise reads on the map as a decision. The user cannot tell it was a mistake, and every later ticket builds on it — one such approval stood for three decisions before anyone checked the number it rested on.

- **NEVER let the ticket's decisions leak into the code as narration**
  **Instead:** Comments, JSDoc and docs state the system as it is. The decision, the before, and the reason it changed go in the PR body and the ticket comment — the places built to carry them.
  **Why:** A transit resolves a ticket that cites a map decision, so the change is the most vivid thing in context while writing it. One run shipped `the old broad prefix used to catch`, `no longer means anything`, a constant documenting how its replaced predecessor worked, and a glossary tombstone for a removed symbol. Every reader after the merge wants the rule in force, not its history.

- **NEVER resolve more than one non-research ticket per run**
  **Instead:** Resolve, ripple, name the next, stop.
  **Why:** The ripple of one decision changes which ticket is next; a batch decides against a frontier that no longer exists.
