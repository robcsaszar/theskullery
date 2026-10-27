# Iteration Guide

Sizing a change and translating symptoms into edits. Loaded in Phase 1.

## Contents

- [Iterate or redesign](#iterate-or-redesign)
- [Signal to fix](#signal-to-fix)
- [One behavior per iteration](#one-behavior-per-iteration)
- [Don't overfit](#dont-overfit)

## Iterate or redesign

Size the change before eliciting details. The two need different treatment, and conflating them
produces an artifact that is neither — a redesign delivered as a patch keeps the old structure's
assumptions while replacing its content.

| | Iterate | Redesign |
|---|---|---|
| Symptom | Problems in specific steps, missing detail | Wrong phases, wrong scope, users route around it |
| Fixes are | Additive | Structural |
| Body affected | Under ~30% | Over ~50% |
| Approach | This workflow | Re-run `ai-forge-create` with the existing artifact as input |

In the 30–50% band, say which way you're leaning and why, then let the user decide. The tell is
usually whether the *sequence* still makes sense: if the phases are right and the content is
thin, iterate; if you keep wanting to move steps around, redesign.

## Signal to fix

When the user describes a symptom rather than a change, translate it:

| Observed signal | Fix |
|---|---|
| Agent asks questions the artifact should answer | Add to the body or a reference |
| Output varies run to run | Add a template or example; lower the freedom for that step |
| Steps get skipped | Make the step an explicit checkpoint with a completion criterion |
| Agent invents its own approach | Tighten the instruction — it is too loose, not too short |
| Wrong result despite following instructions exactly | Fix the instructions. The model did what you wrote |
| Fails on edge cases | Add validation and error handling |
| Takes too many turns | Consolidate steps |
| Agent does work that produces nothing useful | Cut the instruction causing it |

The fifth row is the one authors resist. When an agent follows an instruction precisely and the
result is still wrong, the instruction is wrong. Re-reading the transcript to confirm the model
complied is worth more than another round of rewording.

## One behavior per iteration

Change one thing, re-run, observe. Changing three and re-running tells you the aggregate moved,
not which change moved it — and if two changes pull in opposite directions the net can read as
"no effect" while both are doing damage.

Re-run the artifact's `evals/` suite after every change and treat a failure like a failing unit
test, not like a flaky run to be re-rolled.

## Don't overfit

Iterating against the same two or three examples produces an artifact that works on those
examples. The examples are there because they're fast to check, not because they're the
distribution.

When an issue resists a direct fix, try a different framing or metaphor rather than stacking
another constraint onto the one that isn't working. Piling on specificity is how a general
artifact becomes a lookup table for three cases.
