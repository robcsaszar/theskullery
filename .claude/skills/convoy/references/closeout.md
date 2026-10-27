# Close-out

Phases 5b through 6b — walkthrough, report, human handoff, ticket close-out. Loaded when Phase 5 completes.

## Phase 5b — Walkthrough

A **rendered surface** is a page, component or layout a person looks at — not an API, a migration or a pure function. For every route item whose acceptance criteria name one, the orchestrator drives it: a capture at the viewports the item's acceptance criteria name — desktop alone when they name none — attached to the ticket with one line on what it shows. Where the orchestrator cannot drive it (no browser, a screen that needs a second device, a live game), it files one `mode:human` visual-check ticket per surface with exact steps and what "done" looks like; that is work for hands, not a decision, so the mode label is right. Tests and CSS arithmetic pass on pages nobody can use; the walkthrough is where the convoy looks.

Completion: every rendered item has a capture on its ticket or an open visual-check ticket.

## Phase 6 — Report

Update the map: fog from the reviews, user paths left in the tree, foreign commits seen. File a route item for every gap an agent surfaced (see NEVER); Phase 6b does the same for the fog and declined findings the convoy itself wrote. Push nothing unless asked in the invocation. Tick a Route item only when `git merge-base --is-ancestor <sha> origin/main` holds; until then it is **committed, unpushed**, a state the report names with its commit range. The Route section says **shipped** only after Phase 5b's captures or tickets exist and Phase 6b has filed its tickets — ancestry ticks the boxes, 5b and 6b gate the word.

Report: items shipped, bugs the reviews caught that the gate could not, anything reverted, what is still open, and what is pushed. Then **Gates**, one line per gate: `ran: <command> → <result>`, `not run: <command> — <why>; would catch <what>`, or `absent: <the check that does not exist yet>` — a gate left out reads as passed. Then one **ledger** line counted from the log folder: spawns per agent (`briefs/`), briefs with no report, re-queues, reverts.

## Phase 6a — Human handoff

A **human task** is a `mode:human` ticket, or a report line the gate marked "needs the user" — a path the sandbox could not write (`.env*`, `.github/`), a secret, a screen only eyes can check. Never a decision (see NEVER).

Walk them one at a time: tickets by number, then report-line tasks in gate order. Write each task for someone who was not in the session: the path in full, the value in full, the command copy-pastable. Per task: the goal in one line; the exact steps — paths, commands, values, and what "done" looks like; the check the convoy will run on completion. Then:

```text
(d)one / (s)kip / (b)locked
```

On `(d)`: run the named check yourself; passes → close the ticket with a comment naming the check, tick its Route box; fails → show the output and ask again. On `(s)`: leave the ticket open, comment "skipped by the user on <date>". On `(b)`: ask what blocks it in one question, record the answer on the ticket, move on. Do not present the next task until the current one is answered.

Completion: every human task closed, skipped, or blocked with its reason on the ticket.

## Phase 6b — Close-out

Once the last human task is answered: tick every Route item whose commit now holds by ancestry (`references/gate.md` § Ticking by ancestry). Comment on every sub-issue still open that carries no comment from this convoy yet, with its state — reverted with output, blocked, or awaiting push. Every Fog line, declined audit finding, or "revisit" note the convoy itself wrote gets a ticket on the map — `meridian:decision` when it needs a decision, `meridian:slice` with the mode label when it is work — and the ticket link replaces the fog line it came from (the tracker doc: a fog line and its ticket never coexist); a convoy-authored fog line without a ticket is a gap the next session has to rediscover.

Then close by ancestry: every sub-issue whose closing commit holds on `origin/main` and is still open (the trailer did not take, or the user reopened it) is closed with a comment naming the commit. The map itself closes — with a comment naming the commit range — only when every Route box is ticked **and** no open child remains. Close-out that files tickets keeps the map open; the report names each child holding it and what it needs: an agent, a human, or a decision.

Completion: no convoy-authored fog, declined finding, or open sub-issue without a ticket or a comment saying why; the map closed, or open with every holder named.
