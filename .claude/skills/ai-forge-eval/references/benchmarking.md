# Benchmarking

Statistical extension of the five-phase eval. Loaded only in **Benchmark mode** (repeated trials, persisted trend, regression gating). Skip for single-run behavioral eval.

## Contents

- [Trial protocol](#trial-protocol)
- [Aggregation](#aggregation)
- [Flaky detection](#flaky-detection)
- [Gating thresholds](#gating-thresholds)
- [Stale-guard (artifact hash)](#stale-guard-artifact-hash)
- [Trial-results schema (agent writes)](#trial-results-schema-agent-writes)
- [benchmark.json schema (script writes)](#benchmarkjson-schema-script-writes)
- [Running the aggregate script](#running-the-aggregate-script)

## Trial protocol

- Run each eval **N times** (default 3). More trials → tighter variance estimate; 3 is the floor for a meaningful std-dev.
- Per eval, spawn all N trial-pairs (2N subagents — N with-artifact, N baseline) in **one** message. Drain that eval's notifications, capturing each `<usage>` block on arrival (Phase 2), then move to the next eval.
- Do **not** spawn every eval's trials at once: a 3-eval × 3-trial suite is 18 subagents, and interleaved notifications make per-arrival `<usage>` capture unreliable. Bounded batching (2N per eval) keeps it tractable.
- Identical prompt across every trial and both arms — only the artifact instruction differs (see the eval NEVER rules).

## Aggregation

Per eval, per arm, collect the N trials' `pass_rate`, `tokens`, `duration_ms`. Compute:

- **Mean** — arithmetic mean of the N values.
- **Std-dev** — *sample* standard deviation (n−1 denominator). With n < 2, std-dev is 0.
- **Delta** — `with_artifact.pass_rate_mean − baseline.pass_rate_mean`.

`null` usage fields (notification lacked a `<usage>` block) are excluded from that metric's mean; pass_rate is always present (from the assayer). The `aggregate-benchmark.cjs` script does all of this — do not compute by hand.

## Flaky detection

An eval is **flaky** when its with-artifact `pass_rate_std` exceeds `max_flaky_std` (default 0.2). Flaky evals gate a benchmark: a skill that passes inconsistently is not shippable even if its mean is high. Report the flag; recommend more trials or a scope/trigger fix.

## Gating thresholds

Defaults (override via script flags):

| Threshold | Flag | Default | Gate fails when |
|---|---|---|---|
| Min pass rate | `--min-pass-rate` | 0.8 | any eval's with-artifact `pass_rate_mean` < it |
| Max flaky std | `--max-flaky-std` | 0.2 | any eval's with-artifact `pass_rate_std` > it |
| Max regression | `--max-regression` | 0.1 | any eval regresses vs prior by more than it (same artifact only) |

Gate fail → verdict **"regressed — not ready"** (we do not publish; the gate blocks the "ready" verdict, nothing external).

## Stale-guard (artifact hash)

The script stores a SHA-256 of the artifact file in `benchmark.json`. On the next run it compares hashes:

- **Hash unchanged** → vs-prior deltas are real drift; the regression threshold gates.
- **Hash changed** → the artifact was edited; vs-prior deltas are labelled `"artifact_changed": true` and do **not** gate on regression (you expect change). Absolute thresholds (min pass rate, flaky) still gate.

This prevents the failure of silently comparing two different artifacts as if they were the same skill over time.

## Trial-results schema (agent writes)

Write the captured trials to a scratch JSON, then pass its path to the script:

```json
{
  "artifact": "ai-forge-recap",
  "artifact_path": ".claude/skills/ai-forge-recap/SKILL.md",
  "n_trials": 3,
  "evals": [
    {
      "eval_id": 1,
      "prompt": "<eval prompt>",
      "trials": [
        { "trial": 1, "arm": "with_artifact", "pass_rate": 0.8, "tokens": 12000, "duration_ms": 14200,
          "expectations": [ { "text": "output has a Phase 1 header", "passed": true } ] },
        { "trial": 1, "arm": "baseline",      "pass_rate": 0.4, "tokens": 9000,  "duration_ms": 9100,
          "expectations": [ { "text": "output has a Phase 1 header", "passed": false } ] }
      ]
    }
  ]
}
```

`tokens` = `subagent_tokens`, `duration_ms` from each notification's `<usage>` block; use `null` when absent.

`expectations` is optional but worth including — it is the per-assertion grading from the assayer, verbatim (`text`, `passed`, `evidence`). When present in both arms, the script classifies each assertion by whether it actually discriminates between them:

| Verdict | Meaning |
|---|---|
| `discriminating` | Passes with the artifact, fails without — real signal |
| `non_discriminating` | Passes in both arms; measures the model, not the artifact |
| `broken_or_unreachable` | Fails in both arms; broken assertion or beyond model capability |
| `artifact_hurting` | Passes without the artifact but fails with it — **gates the benchmark** |
| `flaky` | Inconsistent across trials |

Non-discriminating assertions are the quiet failure: a suite made of them reports a healthy pass rate while measuring nothing. They surface in `assertion_warnings` rather than gating, since replacing them is an authoring decision.

## benchmark.json schema (script writes)

```json
{
  "artifact": "ai-forge-recap",
  "artifact_hash": "sha256:…",
  "timestamp": "2026-07-09T12:00:00.000Z",
  "n_trials": 3,
  "thresholds": { "min_pass_rate": 0.8, "max_flaky_std": 0.2, "max_regression": 0.1 },
  "evals": [
    {
      "eval_id": 1,
      "with_artifact": { "pass_rate_mean": 0.8, "pass_rate_std": 0.0, "tokens_mean": 12000, "duration_ms_mean": 14000 },
      "baseline":      { "pass_rate_mean": 0.4, "pass_rate_std": 0.0, "tokens_mean": 9000,  "duration_ms_mean": 9100 },
      "delta_mean": 0.4,
      "flaky": false
    }
  ],
  "summary": { "with_pass_rate_mean": 0.8, "baseline_pass_rate_mean": 0.4, "delta_mean": 0.4 },
  "gate": { "passed": true, "failures": [] },
  "comparison": { "prior_timestamp": "…", "artifact_changed": false, "regressions": [] }
}
```

## Running the aggregate script

```bash
node scripts/aggregate-benchmark.cjs \
  --trials <scratch-trial-results.json> \
  --prior benchmarks/<artifact-name>.json \
  --artifact <path-to-artifact-file>
```

- `--prior` is optional; omit or point at a non-existent file on the first run.
- The new `benchmark.json` payload prints to stdout — save it to `benchmarks/<artifact-name>.json` (committed) as the next baseline.
- Errors (bad JSON, missing artifact) go to stderr with exit 1.
