---
name: meridian
description: "Plans a body of work into a durable decision map — a plans/ file by default, or a configured issue tracker — and a route of tracer-bullet tickets. Use whenever the user wants to plan something out — a feature or bug that needs scoping before code, an idea too vague to act on, a wish to brainstorm directions, or feeling stuck — even if they don't ask for a formal plan. Runs bearings, rounds and route in one sitting; resumes a map at its last checkpoint. Trigger phrases — plan this out, help planning, let's brainstorm, scope this, break this down, turn this idea into a plan, roadmap this, chart the route, to spec, to tickets. Don't use for implementing a route item on an existing map (transit or convoy), naming or wording brainstorms, personal or event logistics, tasks the user mainly wants done now, a quick sketch of a small in-session change, auditing existing code (crucible), interrogating shipped work (socratic), or reviewing how the session was conducted (retrospective)."
---

# Meridian

The plan is the meridian — the fixed line the whole body of work steers by. Take bearings → diverge if fogbound → chart the frontier → chart the route, in one sitting while the user is present. Route items are worked by **transit** or **convoy** afterwards, never here. The map lives where the team already works, and it outlives every session. Order of operations: resolve the workspace, resume if a map exists, then Phase 1.

## The workspace

Before any write, settle where the map lives. The default is a file in the repo; a tracker is used only when one is configured or named — never adopted on a repo signal alone.

1. **Persisted choice** — a `## Planning` section in `CONTEXT.md`, else in `CLAUDE.md`. If present, use it silently; no confirm.
2. **The user names one** in the request — `github-issues`, `jira`, or `local-markdown`. It overrides rung 1 for this map; persist it only if the user asks.
3. **Otherwise `local-markdown`** — `plans/<slug>.md`. No confirm: a file in the working tree is not a shared system. If the repo shows tracker signals (`.github/ISSUE_TEMPLATE/`, open issues on the remote, Jira keys in commits), say so in one line and offer the tracker as an alternative; the default stays the file.

A tracker named on rung 2 ends in a **confirm** before the first write, phrased as a judgment question. On confirm, ask once: "Record this in CONTEXT.md (or CLAUDE.md) so future sessions skip this step?" Write the section only on yes; if neither file exists, offer to create `CLAUDE.md`. Offer the same once for a local-markdown map that outlives one session. The persisted line carries what the tracker doc needs:

```markdown
## Planning

Tracker: github-issues · Map query: label meridian:map
```

For Jira, also record the project key, the map and ticket issue types, and the blocking link-type name.

As soon as the rung resolves — before any confirm, since reads such as the map query need none — **MANDATORY READ** `references/trackers/<tracker>.md`. Every map operation — create map, create ticket, wire blocking, claim, frontier query, resolve and close, graduate fog — is done the way that doc says, never improvised. If the doc is missing, fall back to `local-markdown.md`; if that is missing too, use `assets/PLAN.template.md` and tell the user the tracker reference was unavailable.

## The map

One map per effort. By default it is `plans/<slug>.md` from `assets/PLAN.template.md`, tickets as rows in its Frontier table; on a tracker it is a single map item labelled `meridian:map` with tickets as child items. Escalate to `plans/<slug>/` only when Bearings demand multiple documents (spec, PRD) — the map stays the index.

**Seven sections, always all,** in `assets/PLAN.template.md` order — Destination, Bearings, Decision log, Frontier, Fog, Ruled out, Route; the template says what each holds. On a tracker the Frontier section stays empty and is found by query.

**The map is an index, not a store.** A decision lives in exactly one place — its ticket — and the map gists it and links. Refer to tickets by name, never bare number; a wall of `#42 #43` is illegible.

**Tickets.** Each frontier decision is its own ticket, sized to one session, body headed `## Question`. Each carries exactly one type label:

| Label | Type | What unblocks it | Mode |
|---|---|---|---|
| `meridian:decision` | Judgment | Only the user can answer — the answer changes what gets built or what a user sees | HITL |
| `meridian:scout` | Research | Evidence from the codebase or the world | AFK |
| `meridian:prototype` | Experiment | Talking cannot settle it; a throwaway prototype the user reacts to can | HITL |
| `meridian:task` | Task | Nothing to decide — work that must happen first (access, sample data, a signup) | declared |

**Mode.** A HITL ticket resolves only through a live exchange with the user; an agent never stands in for the user's side of it. An AFK ticket an agent drives alone. Judgment and experiment are HITL by type, research AFK by type. Task and route tickets *declare* their mode with a second label at creation — `mode:agent` or `mode:human` — so an unattended run can tell what it may take. Tiebreaker: if the outcome *resolves* a decision it is an experiment; if it only *enables* one it is a task. Route items (Phase 4) carry `meridian:slice` so they never pollute the frontier query. If any label already exists with a different meaning in the tracker, ask before reusing it.

**Internal choices.** A choice whose answer changes neither what gets built nor what a user sees — an internal structure, a helper's shape, a name only the code carries — is not a ticket. The session decides it and writes one Decision log line, Via I: the choice, the reason, and the condition that would make it wrong. The route gate lists every Via I line, and the user may reopen any as a judgment ticket.

**Blocking** uses the tracker's native dependency relation so the frontier is visible in its own UI; a **claim** is an assignee, set before any work. The **frontier** is the open, unblocked, unclaimed tickets.

## Sessions

A planning session runs Phases 1–4 in one sitting: bearings, divergence if fogbound, the rounds until the frontier is empty, then the route. Every decision the user makes is still its own ticket — the ticket is the record, not the hand-off; an internal choice is its Via I log line alone. A judgment answered in a round is written to its ticket and closed in the same session; a research ticket is claimed and scouted while the rounds continue; an experiment is prototyped in-session when the user is present. Route items are the one thing meridian never works: transit takes one, convoy takes the map.

A session stops only on a checkpoint the user must clear — the map checkpoint, a visible candidate they have not answered, an experiment they have not reacted to, the route gate, the seams, the quiz — or because the user leaves. It writes that checkpoint into the map's Route section as **Waiting on the user: …** before ending, and the next session resumes from it. The two gates write `Waiting on the user: map accepted or more grilling?` and `Waiting on the user: route accepted or rounds reopened?`

**Resume first.** Before creating a map, look for one — the tracker doc's map query *and* glob `plans/*.md`; a map found only in `plans/` on a tracker workspace is stale — ask whether to migrate or ignore it. If found, load the map body only (not every ticket), run `node .claude/skills/meridian/scripts/validate-map.mjs map <file or ->` and report what it prints, restate Destination and the current frontier in two lines, honour any **Waiting on the user** line first, and continue from the map's state: a Waiting line naming the map checkpoint or the route gate → re-offer that prompt and do nothing else until it is answered; open decision tickets → continue the rounds here; frontier empty and no Route → Phase 4; Route present → hand to transit or convoy; the user brings new scope to a live map → run Phase 3 rounds on that branch only. Several plausible matches → list them and ask; never guess. A changed Destination marks the map superseded and starts a successor linking back.

## Phase 1 — Take bearings

Name what the user brought — idea, feature, bug, an itch to brainstorm — and state a candidate Destination in one sentence they would sign. Pitch it one level above the task as phrased: ask what should happen once this is done, and write that outcome as the Destination (a bug → this class of crash never recurs, not this crash fixed). The tell for more altitude is work that will be discussed in recurring meetings or reviews: the Destination is what those meetings exist to produce. Creative work keeps the altitude the user set. Then diagnose:

- Destination statable and confirmed → create the map, fill Destination and Bearings.
- Destination vague, directions missing or all obvious, or the user signals stuckness → create the map, fill Bearings with what is known and the fog symptom in place of a Destination.
- The user rejects the candidate without naming what's wrong → the rejection is the fog symptom; same as above.

Ask at most two orienting questions here; deeper questions belong on the frontier where they are tracked.

**No fog, no map.** Before creating the map for a signed Destination, sketch the Phase 3 sweep: if nothing in it outlives this session, say so and ask how the user wants to proceed instead of charting a map for one sitting's work.

**The map checkpoint.** Once the map item is recorded — Bearings filled, and a signed Destination or a named fog symptom — stop and put it to the user:

```text
Map recorded: <name> — <link>
Accept charts the frontier from here; keep grilling opens more branches first.
(a)ccept / (k)eep grilling
```

`(a)` is exactly a fresh invocation or a resume — Phase 2 if fogbound, else Phase 3. `(k)` means the user is not ready or does not agree with what is charted: re-open the Destination, widen Bearings, surface the branches of the design tree they are missing, write what changed to the map, then offer the same prompt again. No cap on passes.

Completion criterion: the workspace is resolved (confirmed where the ladder requires it), the map exists with Bearings filled and either a signed Destination or a named fog symptom, and the map checkpoint was accepted.

## Phase 2 — Diverge (only when fogbound)

MANDATORY READ [`references/divergence.md`](references/divergence.md) before running any move. Do NOT load it when Phase 1 routed straight to Phase 3.

If the reference is missing or unreadable, do not improvise moves: write the fog symptom into the map, tell the user the reference was unavailable, and end the session.

Match the symptom to one move — one move per pass, never two. Run its full loop including the kill rule and record everything on the map: survivors as candidate directions, dead ideas in Ruled out with kill reasons. Present survivors and let the user pick — divergence never converges on their behalf. A second pass with a different move is allowed if the user asks or nothing survived. A barren or unfinished pass ends the session with the fog symptom written into the map; the next session resumes from it.

Completion criterion: the user has picked a direction, the Destination is written from it, and Ruled out is non-empty or the barren pass is recorded.

## Phase 3 — Chart the frontier

Sweep the whole body of work breadth-first — scope, users, data, interfaces, sequencing, risks, quality bar — as a **design tree**, every decision branching into the ones that hang off it. Put the sweep to the user in **rounds**:

- Before the first round, restate the Destination as verbs — what it must get whom to do, in what time — and name the fields whose practitioners do that work; each field is a sweep lens, and one is an adversary (what a short seller or a forensic accountant would check). Take each field's methods, tools, and raw material, never its voice: a lens that only changes vocabulary is role-play and finds nothing.
- A round is the tree's current frontier — every candidate decision whose prerequisites are settled. Number each, give its type, and where you have one, a recommended answer with its main weakness and, for each rival, the condition under which it would be the right call and why that condition does not hold now. A candidate that depends on another still open this round belongs to a later round.
- A candidate whose answer changes what a user sees or does is **visible**. A visible candidate needs a typed or picked answer; silence leaves it on the frontier — it is never taken as confirmed. Its recommendation states in one sentence what the user will experience, names the *user's* cost as the weakness (never the code's), and marks anything it adds beyond the user's ask as the recommender's proposal.
- A round that carries a visible candidate carries a capture of that surface as it is now; a proposed state that can be prototyped and thrown away in one sitting is prototyped. Capture path in this repo: variants rendered on the real page behind a `?variant=` search param, the dev server from `CLAUDE.md` § Commands plus a `playwright-cli` screenshot, and the throwaway edit reverted once the shots exist. Only when no capture is possible does the question say so in words. A visible candidate that talking cannot settle is an experiment by the tiebreaker above.
- A candidate that only a migration on live data, a public contract change, or a rewrite could undo is **one-way** — say so on its ticket and its Decision log line. Before a round that holds one-way candidates, spawn one `refuter` over all their recommendations — each a claim, with the Destination and the Decision-log lines it rests on. Each question then shows the strongest objection that survived; a REJECTED recommendation is rewritten before it is asked.
- Facts are yours to find — the `scout` agent for where something is, a researcher for what is true — for anything in the filesystem, tools, or docs; never ask the user for a fact you could look up. Only the questions downstream of a running researcher wait.
- The user confirms, merges, kills, or answers each candidate. A killed candidate → Ruled out with its reason. An **answered** candidate is recorded on its ticket and in the Decision log, Via J (see below). What cannot yet be framed as a question → Fog, with what would clarify it; the test is whether the question can be *stated* precisely now, not answered. Do not pre-slice fog into tickets.
- Sharpen terms as they surface (see Rules).

Every candidate becomes a ticket as soon as it is stated, and blocking is wired in a **second pass** — items need ids before they can reference each other. Claim every research ticket that blocks an open ticket or feeds a route item and fire a researcher on each now — a `general-purpose` subagent, `model: sonnet`, briefed per transit `references/dispatch.md` § meridian:scout, never the `scout` agent, which returns locations only. A research ticket that does neither is wired to what it informs or closed not planned before anything is spent on it. Researchers run in parallel and report back as text while the rounds continue. An answered candidate is recorded on its ticket the tracker doc's way — the user's words as the resolution comment, closed, one Decision log line — in the same session. An experiment is run in-session via the repo's `prototype` skill when the user is present and recorded the same way from their reaction. One that cannot run in one sitting — it needs live players, real data, or production infrastructure — is deferred to a spike route item the tracker doc's way; only experiments defer. Record each finding per the tracker doc's *Resolve and close*; findings follow `.claude/skills/transit/references/dispatch.md` § meridian:scout (every claim cited and confidence-flagged) — if that file is absent, require a citation on every claim and mark uncited ones as speculation. A finding's cited paths are kept with it, each with the short commit it was read at (`path:line @<sha>`) — Phase 4 draws Known locations from them, and a later session diffs them to see which premises moved. A finding that implies a decision becomes a new judgment ticket, never a decision.

**The route gate.** When the frontier is empty, restate the Destination and the decisions that closed in a few lines, list every Via I line with one-way ones first, then put it to the user:

```text
Frontier empty — <n> decisions logged (<n> internal, listed above), <n> ruled out.
Accept charts the route; revise reopens the rounds or turns an internal choice into a judgment ticket.
(a)ccept / (r)evise
```

`(a)` goes to Phase 4 in the same session. `(r)` asks what is wrong, runs more rounds on that branch, and offers the prompt again once the frontier is empty.

Completion criterion: every candidate the rounds surfaced is a closed ticket with a log line, a Ruled out line, a Fog line, or an open ticket named in Waiting on the user; blocking is wired; research scouts are fired and their findings recorded; the route gate was accepted.

## Phase 4 — Chart the route

Precondition: no open, undeferred tickets. MANDATORY READ [`references/route.md`](references/route.md) for the spec shape, seam rules, slicing rules, and route item body.

Then, per the reference and in this order: spec (only when Bearings demanded one or the Route exceeds a handful of items) → seams confirmed with the user → tracer-bullet slices → quiz → Known locations filled from the map's findings and checked by one `verifier` spawn (CORRECTED fixes an entry, REJECTED drops it) → on a tracker, every item body piped through `validate-map.mjs item -` (exit 1 blocks publishing it; exit 2 means the script could not run — say so); on local-markdown each Route line carries the template's fields instead → publish as `meridian:slice` items, each with `mode:agent` or `mode:human`. An item no decision demanded is scope creep — flag or cut it. An item whose file set no finding covers is published with `None established.` — locating it is transit's or convoy's work, never a reason to hold the route.

Name the **first move** — the smallest route item that unblocks the most — mark the map route-ready, and stop. Implementation is transit's or convoy's job.

Completion criterion: every log entry is reflected in a route item or explicitly needs no work; seams are confirmed; the quiz was accepted; every item has acceptance criteria, a mode label, and wired blockers; every flow-changing item names its Landing per role; every item carries Known locations — cited entries or `None established.`; the first move is named; nothing has been implemented.

## Rules

- Ruled out stays on the chart — every killed path keeps its name and kill reason; visible dead ends are what make the surviving plan credible.
- A path killed on reasoning alone — layout arithmetic, code shape, an estimated cost — never on a render or a run, is an experiment, not a Ruled out line: a cost nobody has seen has a way of vanishing the first time someone uses the thing.
- A barren move says so — "this produced nothing" is a valid result. A session where every technique works was faked.
- Every recommendation names its main weakness; one without is advertising.
- A finished map with an empty Ruled out and no weighed alternatives in the log is flagged as untested — nothing was weighed, so nothing was chosen.
- Research answers cite their evidence; an uncited claim is speculation and is marked as such.
- Terms are sharpened as they land: a term that conflicts with `CONTEXT.md`'s glossary is called out and settled; a fuzzy or overloaded one gets a canonical name; a resolved term is written to `CONTEXT.md` immediately, glossary only, never implementation detail. A term settled but not yet built goes to the spec's vocabulary section now; the glossary entry follows the code.
- A quality bar is a specific hard number — 200 ms, zero crashes — written as reachable; "as fast as practical" cannot fail, so nothing was decided. Ask for the number the user would call unreasonable and treat it as solvable until a run shows otherwise.
- A numeric threshold or counted quantity entering the Decision log carries, on the same line, the expression that computes it. Offer an ADR only when the decision is hard to reverse, surprising without context, and a real trade-off — all three.

## NEVER

- **NEVER write to a tracker before the workspace is confirmed**
  **Instead:** Walk the ladder; confirm a named tracker; default to the plans/ file; persist only when the user says yes.
  **Why:** A tracker is shared. An unasked-for map item with five new labels is noise the whole team sees and someone has to clean up.

- **NEVER invent timelines or effort estimates**
  **Instead:** Give the Route order and acceptance criteria only.
  **Why:** A confident "~4.5 weeks" nobody asked for anchors every later scoping conversation to a number with no evidence.

- **NEVER ask a subagent to write the map**
  **Instead:** Scouts return text; the orchestrator writes every artifact.
  **Why:** The map is the only state that survives the session; an agent writing it directly leaves the orchestrator unable to reconcile what the map claims with what was decided.

- **NEVER take a user checkpoint — the map checkpoint, a visible candidate, an experiment reaction, the route gate, the seams, the quiz — by recommendation or on their behalf**
  **Instead:** Put it to the user and wait; if they leave, the ticket stays open and the map's Route section names it under Waiting on the user.
  **Why:** With the whole frontier in view, the pull to finish it turns charting into a monologue that decides for the user — and a decision the agent made reads on the map exactly like one the user made, so every later ticket builds on it.

- **NEVER write a path into a route item's Known locations that no finding produced**
  **Instead:** Cite the scout ticket, prototype, or read that established it; write `None established.` when nothing was.
  **Why:** A guessed path reads on the item exactly like an evidenced one, and a builder briefed to trust it edits the wrong file with confidence.

- **NEVER start implementing route items on your own initiative**
  **Instead:** Name the first move and stop; transit or convoy implements, and only from a ticket labelled for it.
  **Why:** Planning and doing in one sitting bends the route toward whatever is easiest to execute right now.
