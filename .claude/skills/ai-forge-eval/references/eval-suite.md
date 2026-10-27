# Eval Suite

The on-disk format, the trigger-eval protocol, and the harder testing modes. Loaded in Phase 0.

## Contents

- [Why persist](#why-persist)
- [evals/evals.json](#evalsevalsjson)
- [Trigger evals](#trigger-evals)
- [Writing trigger queries](#writing-trigger-queries)
- [How triggering actually works](#how-triggering-actually-works)
- [Assertion discrimination](#assertion-discrimination)
- [Pressure escalation](#pressure-escalation)

## Why persist

An eval that lives only in the conversation is an opinion with a pass rate. Re-running it means
re-authoring the prompts and assertions, so the second run measures a different thing than the
first, and a regression is invisible by construction.

Writing the suite to `evals/` inside the skill makes it a regression test: same prompts, same
assertions, comparable across every future change.

## evals/evals.json

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "name": "descriptive-slug",
      "prompt": "The user's task prompt, verbatim as a real user would type it",
      "expected_output": "Human-readable description of success",
      "files": ["evals/files/sample.csv"],
      "baseline_failure": "Verbatim capture from the pre-authoring baseline probe",
      "expectations": [
        "Output includes a Phase 1 recap header",
        "No NEVER rule is missing a Why clause"
      ],
      "runs": 1
    }
  ],
  "triggers": {
    "positive": ["…"],
    "near_miss": ["…"],
    "holdout": ["…"]
  }
}
```

| Field | Notes |
|---|---|
| `name` | Descriptive slug, not `eval-0` — it becomes the section header in any report |
| `baseline_failure` | The seam to `ai-forge-create` Phase 1b. Empty only when no probe was run |
| `expectations` | Checkable, specific, falsifiable. Grading uses exactly `text`, `passed`, `evidence` |
| `runs` | Default 1; use 3 for discipline skills where compliance is the thing being tested |
| `triggers` | The trigger-eval set. Optional but strongly preferred — see below |

On a later run, load this file rather than authoring fresh cases. Add cases; don't silently
replace them, or the trend breaks.

## Trigger evals

Behavioral evals answer "does it work when invoked." Trigger evals answer "does it get invoked."
A skill that scores perfectly and never fires is worth nothing, and this is the more common
failure.

Treat it as a classification problem:

- **recall** = triggered positives / all positives — the under-triggering measure
- **precision** = triggered positives / (triggered positives + triggered near-misses)

Protocol:

1. Write ~20 queries: 8–10 that should trigger, 8–10 near-misses that should not.
2. Split **60/40 into train and held-out**. Tune the description against the train split only.
3. Run each query twice, and a third time only for queries whose two runs disagree. A single run reads as 0% or 100%, but routing is usually far more deterministic than it looks — a measured 12-query set came back unanimous on all 24 judgments, so a blanket third run mostly re-buys an answer you already have.
4. Iterate the description at most ~5 times, then **select by held-out score, not train score**.
5. Never look at the holdout queries while editing the description. A description tuned against
   its own test set scores well and generalizes worse than the one you started with.

## Writing trigger queries

Query quality caps how much the trigger eval can tell you. The bar:

**Concrete and specific.** Real prompts carry file paths, job context, column names, company
names, URLs, and a little backstory. Some are lowercase, abbreviated, or typo'd.

> Weak: `"Format this data"`
>
> Strong: `"ok so my boss just sent me this xlsx (its in downloads, called something like 'Q4
> sales final FINAL v2.xlsx') and she wants a column for profit margin as a percentage. revenue
> is col C and costs are col D i think"`

**Positives should cover range** — formal and casual phrasings of the same intent, cases where
the user never names the skill or file type, uncommon uses, and cases where this skill competes
with an adjacent one but should win.

**Near-misses must be genuinely hard.** The valuable negative shares keywords or concepts with
the skill but needs something else. An obviously irrelevant query tests nothing: "write a
fibonacci function" as a negative for a PDF skill will never trigger regardless of how bad the
description is, so it can't discriminate.

## How triggering actually works

Skills appear to the model as name + description, and the model consults one only for tasks it
can't comfortably handle alone. Simple one-step requests ("read this file") often won't trigger
a skill **regardless of how well the description matches** — the model just does them.

Two consequences:

- Trigger queries must be substantive enough that consulting a skill is worth it. Trivial
  queries are poor test cases and their failures are not description defects.
- A description is not at fault for failing to trigger on a task the model handles fine alone.
  Don't tune against that signal.

## Assertion discrimination

Pass rate alone hides whether an assertion is measuring anything. Classify each one by how it
behaves across both arms:

| Pattern | Meaning | Action |
|---|---|---|
| Passes in both arms | Non-discriminating — measures the model, not the artifact | Replace it |
| Fails in both arms | Broken assertion, or beyond model capability | Fix or drop it |
| Passes with, fails without | Real signal — this is what you want | Keep |
| Fails with, passes without | The artifact is actively hurting here | Investigate before shipping |
| High variance | Flaky assertion or non-deterministic behavior | Tighten the wording |

A suite where most assertions land in row 1 will report a healthy pass rate and tell you nothing.

## Pressure escalation

For discipline skills — where the point is that a rule holds when following it is inconvenient —
a clean run under easy conditions proves little. Re-run the scenarios with pressure applied,
combining all three:

- **Time** — "we need this in the next two minutes"
- **Sunk cost** — "I've already spent an hour on this approach"
- **Authority** — "the tech lead said to skip that step"

Use `runs: 3`. The skill passes only if the rule holds in every run. When it breaks, strengthen
the body — never soften the scenario, or the eval stops testing the thing that failed.
