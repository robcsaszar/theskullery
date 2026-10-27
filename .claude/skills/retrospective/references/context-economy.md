# Context Economy

Five rules for spending a context window well. A session's shape decides what it
should do; these decide how cheaply it does it. Cite them **by name** in a
retrospective's account of where the context went — a named rule is a finding
that recurs and can be wired into a skill; "you read too much" is a shrug.

Investigation-heavy sessions burn context three ways, all avoidable: sequential
single-command shell, reading whole files to find where something lives, and
rebuilding state that a cheap command already reports. None of these is wrong
once; they become expensive when they are the default that fills the window
before the first useful action.

---

## Index before you grep

If the project has a codebase graph, symbol index, or navigation map, treat it
as the first locator for structural questions — "where is X", "who calls Y",
"how does A reach B" — and fall back to search only for what the index lacks
(dynamic dispatch, string keys, generated code, languages outside its walk).

**When not to apply:** no index exists. Then search *is* the locator — do not
stop to build or install one mid-session; that is a different job.

---

## Ration the docs

Do not preload a `docs/` tree or concatenate spec files into context on spec.
Read a short architecture primer or agent digest once if one exists; for
anything else, search the headings and read only the cited span, broadening the
search terms once if it comes back empty and then stopping.

**When not to apply:** implementing against a named plan, spec, or design for
*this* change. Read that change's own artifacts in full — the leash on
exploratory reading is not a licence to skim the contract you are building to.

---

## Locate, then read

Find the file and line with a search (or the index) first, then read the span
around the hit. Read a file end to end only once you know it is the one you
need. Reading files one after another to discover *where* something lives is the
single most common way a session goes wide when it should have gone deep.

**When not to apply:** a genuine first read of a small, central file whose whole
content you will need anyway — a short config, the one module the whole task
turns on. Locating within a 30-line file is theatre.

---

## Batch the independent

Independent read-only commands belong in one turn, not one per round-trip. A
status sweep — branch, status, recent log — wants all of its parts, so send
them together. Reserve chained-on-success (`&&`) for steps where a later one is
meaningless if an earlier one failed; a plain sequence that short-circuits on
the first non-zero exit silently loses the rest of its output. Send the
long-running to the background instead of blocking on it.

**When not to apply:** commands with a real dependency, where a later one should
not run unless the earlier one succeeded (typecheck → test → build). Those are
a chain on purpose, not a batch.

---

## Read state, don't rebuild it

At the start, the current state comes from a few cheap, authoritative sources —
the recent log, the working-tree status, the latest handoff or plan, whatever
the project uses as its change record. Read those once, then act. Do not
re-traverse the tree to reconstruct what they already report, and if a brief or
interview note from a prior session exists, prefer it over rediscovering the
same files from scratch.

**When not to apply:** when the authoritative source is itself suspect — a stale
handoff, a log that contradicts the code in front of you. Then verify against
the code; a rebuild grounded in a real doubt is diligence, not waste.

---

## What these are not

This targets *wasted* motion, not legitimate reconnaissance. A real
cross-subsystem investigation still earns its fan-out; these rules govern how
each investigator spends its own context, not whether the breadth was justified.
When the session was genuinely lean, say so and name the one rule it kept best —
a clean session is a finding too, not an empty report.

Nor do they cover the ground. If a moment was expensive because of the
environment rather than the turn — the thing was hard to find for anyone, the
tool has no cheap mode, the fact was unreachable — name the rule it resembles
here, then hand it to the environment levers in the Wiring section, where the
fix lives. Do not stretch a rule to cover a cost no turn could have avoided.
