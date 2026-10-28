# Environment Levers

The context-economy rules judge the *turn*: did the session spend its window
well. These levers judge the *ground*: did the environment set the session up
to spend it badly, and which one change to the repo, its checks, or its steering
files stops the next session paying the same cost. A waste that recurs across
sessions is usually a missing lever, not a careless agent — and a lever is
cheaper to pull once than a rule is to obey every time.

Cite the lever **by name** in the Wiring section. Each carries a *use when*
signal; if the session shows no such signal, do not manufacture a candidate.

---

## Navigation pointer

The session spent real turns finding where something lives — a config that
governs a distant module, a hidden dependency between files, the one place a
value is set. A short pointer in the project's steering file (the file every
agent loads on entry) would have made it a single read.

**Use when:** locating a thing cost more than acting on it.

**Not when:** the search was cheap, or an index already exists and simply
was not consulted — that is a turn-side finding under *Index before you grep*.

---

## Automated check

The session made a mistake that a linter, type check, test, formatter, or
filesystem rule would have caught before a human did — and no such check runs.
The fix is a check, not an instruction; a check costs no context and cannot be
skimmed past.

**Use when:** a mistake was caught late, by a person or by a failed run, that a
deterministic tool could have caught first.

**Not when:** the mistake was a judgement call no tool encodes.

---

## Review-stage rule

A standard the session violated belongs in the project's review-stage
standards, not in the implementer's steering. Implementation carries the most
context pressure — exploration, writing, debugging — so an instruction there
competes with the work. Review receives a finished diff and almost no
exploration, so it is the cheap place to enforce style, structure, and
convention. Also fires the other way: an existing review rule that a real
mistake slipped past needs sharpening or removing.

**Use when:** a coding-standard violation shipped, or a review rule failed to
catch one.

**Not when:** the project keeps no review stage — then propose the check, or
say the rule has no home.

---

## Steering trim

The steering file that every agent loads is doing too much. Look for two
things: instructions the session plainly did not act on (a no-op that costs
context on every entry and buys nothing), and long standards or procedures that
belong in a review-stage file, an automated check, or a referenced doc. A
steering file should be short and mostly pointers.

**Use when:** the steering file is long, or an instruction in it changed
nothing this session.

**Not when:** the file is already short and every line was load-bearing.

---

## Tool verbosity

An expensive moment was expensive because of the tool, not the turn — a CLI
that prints a full report where a summary would do, a service integration that
returns whole records for a one-field question, a wrapper with no quiet mode.
The fix is on the tool side: a flag, a narrower endpoint, a filtering wrapper.

**Use when:** the same call would be expensive no matter how carefully it was
made.

**Not when:** the tool has a cheap mode that was not used — that is *Locate,
then read* or *Batch the independent*, a turn-side finding.

---

## Information access

A crucial piece of information was not available to the session at all — a
dev-server log it could not see, a third-party dashboard it could not query, an
error that surfaced only in a place it could not reach. The session guessed, or
asked the human to relay. The fix widens what the agent can read: tee a log to
a file, grant read-only access, expose a status command.

**Use when:** the session stalled or guessed for lack of a fact that existed
somewhere it could not reach.

**Not when:** the fact was reachable and the session did not look.

---

## Where a lever lands

Each lever has a natural home. Name the real file when writing the wire-in.

| Lever | Home |
|-------|------|
| Navigation pointer | The entry steering file — kept short, mostly pointers to where things are |
| Automated check | Lint, type, test, or filesystem config; a pre-commit or CI step |
| Review-stage rule | The project's review standards file; a referenced doc if it grows long |
| Steering trim | The entry steering file (remove or relocate), with the destination named |
| Tool verbosity | The tool's config or a thin wrapper script |
| Information access | Dev tooling, service permissions, or a status command |

Prefer a check over a rule, a rule at review over a rule at implementation,
and a pointer over a paragraph. Look for an existing doc before proposing a new
one.

---

## Ordering

Present lever candidates in order of severity — the one that cost or risked
the most this session first. A mistake that shipped outranks a slow locate;
a slow locate that will recur every session outranks a one-off. Cap at three
levers per retrospective; the rest are noise until they recur.
