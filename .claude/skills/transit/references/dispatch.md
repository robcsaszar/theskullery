# Dispatch recipes

One section per label. Loaded in Phase 2 — read only the section for the claimed ticket.

## Contents

- [Preferred skill or fallback](#preferred-skill-or-fallback)
- [meridian:scout](#meridianscout)
- [meridian:decision](#meridiandecision)
- [meridian:prototype](#meridianprototype)
- [meridian:task](#meridiantask)
- [meridian:slice](#meridianslice)
- [PR body](#pr-body)

## Preferred skill or fallback

Where a recipe says *resolution comment*, on local-markdown that is the Decision log row plus, when the detail exceeds a line, a note under `plans/<slug>/` linked from the row. Where it says *label*, on local-markdown that is the Type column or the `[agent]` / `[human]` marker.

Check `.claude/skills/<skill>/SKILL.md`. Present → read it and follow it, with the substitutions each section names for running it inside a transit. Absent → follow the fallback in that section. The fallback is a condensed form of the same discipline, so a repo without the skill still gets the method; it is not a lesser mode to switch to when the skill feels heavy.

## meridian:scout

Mode: AFK. Resolved by a **researcher** — a `general-purpose` subagent spawned with `model: sonnet`, returning text and writing nothing to the tracker. Not the `scout` agent: that one returns file locations only, never an answer. Its prompt carries the ticket's `## Question` as the whole scope, the names of the tickets it blocks as the decisions its findings must serve, the map's Destination for context, and the rules below.

**Preferred — `delve`.** Put the path to `.claude/skills/delve/SKILL.md` in the researcher's prompt and tell it to follow the Research workflow with two substitutions: step 1 (clarify scope) is replaced by the ticket's Question, since no user is present; and "suggest a search" becomes "run the search". Use delve's multi-source mode when the Question names two or more sources — one subagent per source, one identical extraction schema, all spawned in one message.

**Fallback — research mode.**

1. Investigate against **primary sources** — official docs, source code, specs, first-party APIs, the repo's own history — never a secondary write-up of them. Follow every claim back to the source that owns it.
2. Every claim carries a citation (file and line, URL, commit) and a confidence flag — `[high]`, `[medium]`, `[low]`, or `[outside reliable knowledge]`. An uncited claim is speculation and is labelled so or dropped. Distinguish direct evidence from analogy from inference.
3. Write the findings as the resolution comment. Save a file only where the repo already keeps such notes, matching its convention; none → the comment is the record, with assets linked, not pasted.
4. Close with a recommendation and its main weakness. The researcher never decides; the orchestrator never decides either — a finding that needs a decision becomes a `meridian:decision` ticket (Phase 3).

Completion: every claim in the comment is cited and flagged; the recommendation names its weakness; no decision was taken.

## meridian:decision

Mode: HITL. No preferred skill; the method is folded here.

**Rounds.** The ticket's Question is the root of a **design tree**: every decision branches into the decisions that hang off it. The **frontier** is every sub-question whose prerequisites are settled — ask the whole frontier in one round, numbered, and wait:

```markdown
❓ **Q1** - **<title>**: <body — may run several paragraphs, includes 2–4 concrete options>

➡️ <recommended option> — <why, one or two lines>. Main weakness: <named>.
Rivals lose because: <option> — right only if <condition>, which does not hold: <evidence>; …

---

❓ **Q2** - ...
```

A question whose answer depends on another still open this round belongs to the next round. Each answer reshapes the tree — recompute the frontier and ask the next round. Finding **facts** is the agent's job — anything in the filesystem, tools, or docs goes to a researcher — a `scout` agent when the fact is a location — and only the questions downstream of it wait; the **decisions** are the user's.

- **Before the round.** Every fact a question or its recommendation rests on is checked in the source — researcher first, question second. A question about a rendered surface (one that changes what a user sees or does) carries a capture of that surface as it is now, or says in words that none exists.
- **After the answer.** A premise found false voids the answer; the question is re-put with the correction stated first. A blanket "go with your recommendations" is recorded as *delegated to the recommendation*, not as the user's decision in their words, and the resolution comment names which answers were delegated. A visible question is never accepted inside a blanket — it is re-put on its own.

The ticket resolves when the frontier is empty and the user confirms the shared understanding; the resolution comment is their decisions in their words plus the options they killed and why.

**Glossary, as terms land.** When the user's term conflicts with `CONTEXT.md`'s glossary, say so and settle it. When a term is fuzzy or overloaded — "account", "session", "trial" — propose the precise canonical one. Probe relationships with invented concrete scenarios that force the boundaries. When the user states how something works, check the code agrees and surface any contradiction. Write a resolved term into `CONTEXT.md` right then, glossary only, no implementation detail. Offer an ADR only when the decision is hard to reverse, surprising without context, and the result of a real trade-off — all three — in `docs/adr/`, following the existing numbering.

Completion: frontier empty, user confirmed, resolution comment in the user's words, glossary updated for every term the round settled.

## meridian:prototype

Mode: HITL. A **prototype** is throwaway code that answers the ticket's Question; the Question decides its shape.

**Preferred — `prototype`.** Read `.claude/skills/prototype/SKILL.md`; the Question picks the branch — a logic or state-model question, or a "what should it look like" question. The user reacts to the artifact; that reaction is the resolution.

**Fallback.**

1. Throwaway from day one and named so a casual reader sees it — placed near the module or page it is for, following the repo's routing convention, never a new top-level structure.
2. Trivial to run: one task-runner command, or one HTML file to open.
3. No persistence unless persistence is the question; then a scratch store with a "prototype, wipe me" name.
4. No tests, no error handling beyond runnable, no abstractions.
5. Surface the full relevant state after every action or on every variant switch.
6. Capture: commit it to a throwaway branch `prototype/<slug>`, never the default branch; link the branch from the ticket; the validated decision, and any snippet that encodes it more precisely than prose (a state machine, reducer, schema, type shape), goes in the resolution comment trimmed to the decision-rich part.

An experiment that needs production infrastructure a session cannot stand up is deferred: create the spike as a `meridian:slice` item whose stated outcome resolves this ticket, and leave the ticket open marked deferred.

Completion: the user has reacted to a running artifact, or the spike exists; the resolution names the verdict and the question it settled.

## meridian:task

Mode: declared by its second label. Nothing to decide — work that must happen before a decision can. `mode:agent` → do it with the session's own tools. `mode:human` → walk the person through it — MANDATORY READ [`human-walk.md`](human-walk.md). A person who leaves mid-walk gets the remaining steps in the release comment. The resolution records what was done and **every resulting fact later tickets depend on** — where a credential lives, a new URL, a row count, an access grant.

Completion: the work is done or checklisted, and every downstream fact is in the resolution comment.

## meridian:slice

Mode: declared by its second label. `mode:human` in HITL: implement with the person present; the human-only parts — manual test, design call, access — are walked per [`human-walk.md`](human-walk.md) as they arise, and the PR's Assumptions section lists internal choices only. In AFK gate 5 already rejected it.

Read, in this order: the ticket — What to build, Acceptance criteria, Seams, Blocked by, From decisions; the Decision log lines it cites; the map's spec if one exists; `CONTEXT.md` for vocabulary; ADRs in the area.

**Implement — preferred `tdd`.** Read `.claude/skills/tdd/SKILL.md` and drive it at the ticket's Seams; do not re-negotiate seams that the route session already confirmed.

Before writing, a "where is X" goes to a `scout` agent, never to the session's own grep over a tree it does not know yet. When the slice spans three or more files with no overlapping writes (`docs/agents/delegation.md` or a delegation section of `CLAUDE.md`, when the repo has one), brief a `builder` per § Implement in `.claude/skills/convoy/references/briefs.md` and gate its report yourself — diff, typecheck, the touched suites, every acceptance box — before treating the work as done. Otherwise the session implements.

**Implement — fallback.**

- Red before green: a failing test at the seam, then only the code that passes it. One seam, one test, one minimal implementation per cycle — never all tests first, never all code first.
- Tests observe behaviour through the public interface, never internals; the expected value comes from an independent source (spec, worked example, known-good literal), never recomputed the way the code computes it.
- Refactoring belongs to review, not to the red → green cycle.
- A declarative edit — a config row, a label, a re-export, an API-collection file — gets no new test; the PR's Acceptance evidence names the command that shows it took effect (`shown by <command>`). A pattern, wildcard, condition, order, or computed value is logic and gets its red-first test.
- Typecheck regularly, single test files regularly — the typecheck and single-file rows of `CLAUDE.md` § Agent gate, never the full-suite command with a path — and the full suite once at the end.

**Review — preferred `reviewer` agent** over the branch's commits, `git log origin/HEAD..HEAD`, once the slice is committed: the brief's Context is the ticket's What to build and the invariants its Seams name; the Focus list is the acceptance criteria, highest-stakes first, each with the attack worth attempting; Suites are the test files the slice touched. CONFIRMED findings are fixed as their own commits; PLAUSIBLE ones get one look, then a comment on the ticket. Quote the ticket line beside every spec gap the review surfaces.

**Review — fallback `code-review`** (`/code-review`, or `.claude/skills/code-review/SKILL.md`) when `.claude/agents/reviewer.md` is absent. Fix what it finds before the PR.

**Scope.** Only what the acceptance list needs. Adjacent cleanups become a comment on the ticket for a future item, not commits. Docs the repo requires per change — the docs `CLAUDE.md` names per change — are in scope when the ticket's change touches them.

Completion: every acceptance box has evidence; the repo's checks are green; review findings are fixed or noted; the branch is pushed.

## PR body

```markdown
## Route item

[ticket name](url) — parent map: [map name](url)

## Acceptance

- [x] <criterion> — evidence: <grep output / test name / screenshot>

## Gates

- <command> — ran: <result> | not run: <why>; would catch <what> | absent: <the check that does not exist yet>

## Assumptions

- <anything decided without a human — internal choices included — one line each with its reason, or "none">

Closes #<n>
```
