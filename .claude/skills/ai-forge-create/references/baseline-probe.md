# Baseline Probe

Measure what the agent does *without* the artifact, before writing it. Loaded in Phase 1b.

The recap in Phase 1 collects failure modes the author *asserts*. This step collects the ones
that actually occur. They differ more often than authors expect, and the gap is where the
artifact's value lives.

## Contents

- [Why probe first](#why-probe-first)
- [Protocol](#protocol)
- [The no-failure result](#the-no-failure-result)
- [Failure-form matching](#failure-form-matching)
- [What the capture feeds](#what-the-capture-feeds)

## Why probe first

Writing first and testing later can only confirm the author's framing: eval assertions get
drawn from the artifact's own stated triggers, so they test whether the artifact does what it
says, never whether what it says was needed. Probing first inverts that — observed failures
determine what the body must contain.

The cost is one or two subagent runs. The thing it prevents is an artifact nobody needed.

## Protocol

1. **Pick 1–2 representative tasks.** Draw them from the Discovery recap's domain and failure
   modes. They must be tasks a real user would bring, not synthetic exercises.
2. **Spawn fresh subagents without the artifact.** No skill instruction, no agent context, no
   hints from this conversation. A subagent that inherits your framing is not a baseline.
3. **Capture verbatim.** Record what the agent actually did, the errors it made, and any
   rationalization it offered — in its own words. Paraphrase loses the signal; the exact wording
   of a wrong step is what a later assertion checks for.
4. **Classify the failure** against the table below before choosing a pattern in Phase 2.

Run the probes for both tasks in the same message so they complete together.

## The no-failure result

If the baseline succeeds, say so plainly and stop:

> "Baseline runs completed both tasks correctly without the artifact. This may not need to
> exist. Options — (n)arrow the scope to a harder case, (c)ontinue anyway, or (q)uit."

A clean baseline is a real finding, not a failed step. Continuing is legitimate when the author
knows a harder case exists that the probe missed, but the burden is now to name it.

## Failure-form matching

The *shape* of the guidance should follow the *type* of failure observed. Matching them is the
difference between guidance that changes behavior and guidance that reads well.

| Observed baseline failure | Guidance form that works | Form that doesn't |
|---|---|---|
| Knows the rule, skips it under pressure | Prohibition + rationalization table + red-flag checklist | Soft "prefer"/"consider" phrasing |
| Output structurally wrong despite compliance | Positive recipe — what the output *is*, ordered parts | Prohibition lists alone |
| Required element simply missing | REQUIRED slot in a fillable template | Prose reminders |
| Behavior should vary by context | Conditional keyed to an observable predicate | Unconditional rule plus exemptions |

Two rules that follow from this:

- **Don't write nuance clauses that reopen negotiation.** "Usually do X, though sometimes Y may
  be appropriate" restores the latitude the rule was meant to remove. Express a genuine
  exception as its own conditional with an observable trigger.
- **Freedom decreases from thinking to acting.** Analysis tolerates high freedom; execution
  needs low. A single artifact often spans both — calibrate per section, not per artifact.

## What the capture feeds

One capture, three consumers:

| Consumer | Use |
|---|---|
| Description (Phase 3) | The words the baseline agent used for the task become trigger keywords — they are what a real user types |
| Guidance form (Phase 3) | The failure type selects the form, per the table above |
| Eval assertions (Phase 6) | Each recorded failure becomes an assertion that it no longer occurs |

Carry the verbatim text forward into `evals/evals.json` as each scenario's `baseline_failure`.
That field is the seam between this step and `ai-forge-eval` — it is what makes the eval a
regression test rather than a fresh opinion.
