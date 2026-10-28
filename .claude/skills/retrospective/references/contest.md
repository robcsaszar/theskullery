# Contesting the findings

Loaded in Step 4. A finding from Steps 2–3 — or from a lesson list the user
asks for — is a hypothesis about this session until it passes three tests. The
first pass of a retrospective is pattern-matching on recency; the pass that
survives is the one that tried to break each item.

## The three tests

1. **Evidence.** Cite the moment(s) in this session — the tool call, the report
   line, the commit. No citable moment → the finding falls. "It felt slow" is
   not a moment.
2. **Counter-evidence.** Look for the moment that contradicts it. A rule
   inferred from two cases against twelve is a hunch; say the sample size. A
   fix already present in the artifact that the session ignored is a different
   finding (the rule exists; why was it bypassed?).
3. **Mechanism.** Would the proposed fix have changed the cited moment? Trace
   it: with the rule in place at that turn, what happens instead? A fix that
   could not have fired on the evidence is not a fix. Part of this test: would
   the fix change another skill's rule? Name the conflicting line in the
   sibling artifact; resolve it or the finding falls.

Verdicts: **confirmed** (all three hold, as stated), **reframed** (a test
changed its form — state the new form), **falls** (state which test failed).

## Memory as evidence

Load the project's memory index (`MEMORY.md`) once. Check each finding against
the `feedback` and `project` memories:

- A lesson already recorded is a **recurrence** — say so. It strengthens the
  finding and points at a lever, because a rule that was known and still
  failed wants a check, not a second rule.
- A lesson a memory contradicts must answer the memory or fall.

The retrospective never writes memory. Memory records what the user taught;
a retrospective records what the session showed. They are different sources.

## Worked examples

From a convoy run over a 14-item map, 2026-09-15. The first pass named seven
lessons; contesting them killed two, reframed three, and found an eighth
stronger than most.

**Falls — "probe the sandbox for denied paths at Phase 0."** Evidence held
(`.env*` and `.github/` writes were denied at the first gate). Mechanism
failed: those paths were in no predicted set, so a probe of predicted prefixes
would have probed nothing; and the denial was pattern-based — commands merely
mentioning the path were refused — so a probe would misreport. The narrower
lesson survived: a rename whose old name is an env var predicts config and CI.

**Falls — "put predicted file sets on the ticket."** Mechanism failed on the
sibling test: `meridian/references/route.md` says route bodies carry no file
paths because they rot. And the evidence was weaker than it looked — most of
the per-wave grepping was for brief facts needed anyway; the collision check
itself was one command.

**Reframed — "opus for auth, concurrency, cross-layout items."** Counter-
evidence: the two opus items were not clean (one CONFIRMED, two PLAUSIBLE
review findings); the sonnet items drew the severe ones. Two against twelve is
no sample. What held: the brief hardcoded "Model: sonnet", overriding the
tier table the project already keeps. The fix became a pointer, not a rule.

**Reframed — "tombstone grep on the staged diff."** Evidence: the grep *ran*
before the offending commit and printed `1`, and the commit went through. The
missing thing was not the check but a gate on its output. The fix became a
chained guard that blocks, not a report that informs.

**Found late — "no regex over tests in a rename item."** The brief carried the
rule (three meanings of one word; rename by type). The agent read it and then
ran a bulk sed across ~55 test files, breaking six tests on a subject id that
shared the word. Strongest finding of the set — a rule read and bypassed by
tooling — and the first pass missed it because it was looking at the
orchestrator's turns, not the agents' reports.
