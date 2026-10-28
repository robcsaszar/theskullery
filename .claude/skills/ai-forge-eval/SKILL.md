---
name: ai-forge-eval
description: "Behavioral eval for skills and agents — whether the artifact actually changes model behavior, not just whether it scores well on a rubric. Use when verifying a skill or agent works in practice, or when tracking its performance across repeated runs to catch regressions. Triggers are test this skill, test this agent, eval this, does this skill work, behavioral eval, run eval, benchmark, benchmark this skill, track regression, verify outputs, does this agent work. Don't use for rubric-only scoring — that's ai-forge-judge."
---

# AI Forge Eval

Behavioral validation for skills and agents. Rubric scoring (ai-forge-judge) tells you if an artifact is well-written. Eval tells you if it works.

Works for SKILL.md (skills) and .agent.md (agents). Same 5-phase flow; Phase 2 setup differs by artifact type.

---

## Phase 0 — Load or Write the Suite

**MANDATORY — READ [`references/eval-suite.md`](references/eval-suite.md)** for the on-disk format, the trigger protocol, and the assertion-discrimination table.

Check for `evals/evals.json` beside the artifact.

- **Present** — load it and skip to Phase 2. Add cases if coverage is thin; never silently replace existing ones, or the trend breaks.
- **Absent** — author it in Phase 1 and write it to `evals/evals.json` before spawning anything.

A suite that lives only in this conversation cannot detect a regression next month. Persisting it is what makes the difference between an opinion and a test.

---

## Phase 1 — Write Evals

Write 2–3 eval cases. Each eval is a realistic prompt plus 3–5 assertions.

Prefer prompts drawn from a baseline probe (`ai-forge-create` Phase 1b) over the artifact's own stated triggers — assertions written from the artifact can only confirm it does what it claims. Carry each capture into the scenario's `baseline_failure` field.

**For skills**: prompts that should activate the skill naturally. Assertions check skill-specific behaviors (e.g. "output includes a Phase 1 recap", "NEVER rule format has WHY and INSTEAD").

**For agents**: prompts covering the agent's stated scope. Assertions check observable behaviors — files created, tools called, tone constraints, scope limits (e.g. "did not modify files outside src/lib/", "opened a PR", "commit message starts with 'refactor:'").

**Assertion rules**:

- Checkable: the assayer can verify from the output alone
- Specific: "output includes 'Phase 1' header" beats "output is well-structured"
- Falsifiable: must be possible to fail

Record evals:

```text
Eval 1: <prompt>
Expectations:
- <assertion 1>
- <assertion 2>
- <assertion 3>
```

---

## Phase 2 — Spawn Parallel

For each eval, spawn the **with-artifact and baseline runs in the same message** (never sequentially). In benchmark mode this becomes N trial-pairs per eval — see Benchmark mode below.

**With-artifact run**: give it the eval prompt. For skills: add "Use the `<skill-name>` skill for this task." For agents: paste the agent's full instructions as the system context.

**Baseline run**: depends on what is being measured.

- **New artifact** — same eval prompt, no skill instruction, no agent context. Plain assistant response.
- **Improving an existing artifact** — snapshot the current version first (`cp -r <path> <scratch>/snapshot/`), then point the baseline at the snapshot. "No artifact" is the wrong control when the question is whether the change helped; it measures the artifact's existence, not the edit.

**Capture immediately on completion**: when each task notification arrives, record which run it was (plus trial index in benchmark mode) and read `duration_ms` and `subagent_tokens` from its `<usage>` block — exact, not estimated. An agent's result and its `<usage>` block can arrive in two separate messages, so a hand-back without usage is not yet a missing measurement — record `null`, and overwrite it if a later notification for that same task id carries the block. Never substitute a wall-clock guess. This data exists only at notification time and cannot be reconstructed afterward.

Store per eval: `with_artifact` and `baseline` output text, plus `duration_ms` and `tokens` for each arm.

---

## Phase 3 — Grade

MANDATORY READ: [`agents/assayer.md`](agents/assayer.md)

For each eval, invoke assayer on both outputs. Pass:

```text
Output: <output text>
Expectations:
- <assertion 1>
- <assertion 2>
```

Assayer returns per expectation:

```json
{ "text": "...", "passed": true, "evidence": "..." }
```

Compute `pass_rate = passed / total` per run.
Compute `delta = with_artifact.pass_rate - baseline.pass_rate`.

Then **classify each assertion** by how it behaves across both arms — passes in both (measures the model, not the artifact), fails in both (broken or out of reach), passes with and fails without (real signal), fails with and passes without (the artifact is hurting), or high variance (flaky). See the table in [`references/eval-suite.md`](references/eval-suite.md). A suite whose assertions all pass in both arms reports a healthy pass rate and tells you nothing.

Also read the transcript, not just the output: did the run actually follow the artifact, or reach the right answer despite it? Work the artifact caused that produced nothing is a cut candidate.

---

## Phase 3b — Human Review

Before analyzing anything yourself, put the raw outputs in front of the user.

Fill [`assets/eval-review.html`](assets/eval-review.html) — substitute `__ARTIFACT_NAME__` and `__EVAL_DATA__` (a JSON array of `{id, name, prompt, with_artifact, baseline, assertions}`) and write it beside the eval suite. Surface it with a file-delivery tool if available; otherwise give the user the path. Read the exported `feedback.json` when they're done.

The model grading its own artifact's output is the weakest signal here — a human glance catches what no assertion was written to catch. Skip only if the user declines.

---

## Phase 4 — Compare (optional)

MANDATORY READ: [`agents/arbiter.md`](agents/arbiter.md) — load only when Phase 4 runs.

**Run Phase 4 when**: delta > 0.1 on any eval, or pass_rates conflict across evals.

**Skip when**: pass_rates are identical, or user requested grades only.

Arbiter input: Output A (unlabeled), Output B (unlabeled), expectations list. Record which was which for Phase 5.

Arbiter returns: content score (1–5), structure score (1–5), winner (A/B/tie), rationale, strengths/weaknesses per side.

**Ship gate when comparing two versions**: ship only if the new version **wins or ties every scenario, and wins at least one**. A version that wins big on one case and loses on another has traded one failure for a different one — that is not an improvement, and the aggregate delta will hide it.

---

## Phase 5 — Analyze + Report

MANDATORY READ: [`agents/refiner.md`](agents/refiner.md) — load only if Phase 4 ran.

If Phase 4 was skipped: go directly to benchmark table.

Refiner input: arbiter output + label mapping `{ "A": "with_artifact", "B": "baseline" }` (or reversed). Refiner explains why winner beat loser and surfaces 1–3 prioritized improvements.

**Render benchmark table** — one row per eval plus an `Avg` row, columns `Eval | with_artifact | baseline | delta | duration_ms (with / base)`, pass counts and percentages per arm. Append any non-discriminating or hurting assertions flagged in Phase 3, then the refiner's improvement suggestions if it ran.

If delta is negative on any eval, flag: "Artifact may be hurting performance — review trigger phrasing or scope constraints."

---

## Phase 6 — Trigger Check

Behavioral evals answer "does it work when invoked." This answers "does it get invoked" — the more common failure, and invisible to every phase above.

Run when the suite has a `triggers` block, or offer it after Phase 5. **MANDATORY — READ [`references/eval-suite.md`](references/eval-suite.md)** for the protocol, the 60/40 holdout split, and the query-quality bar. Do NOT load it for a behavioral-only run.

Report recall and precision per split (train and held-out) plus the specific misses and false positives. Low recall with high precision means the description is too narrow — widen it. The reverse means it is poaching adjacent tasks — add negative triggers.

---

## Benchmark mode

Trigger when the user asks to benchmark, track regression, or gate on trend. Benchmark mode extends the five phases with repeated trials and a persisted trend store.

MANDATORY READ: [`references/benchmarking.md`](references/benchmarking.md) before running — trial protocol, aggregation formulas, gating thresholds, and the trial-results + `benchmark.json` schemas live there. Do NOT load it for a plain single-run eval.

- **Trials** — each eval runs N times (default 3). Per eval, spawn all N trial-pairs (2N subagents) in ONE message, drain that eval's notifications capturing `<usage>` per Phase 2, then move to the next eval. Never spawn every eval's trials at once.
- **Aggregate** — `node scripts/aggregate-benchmark.cjs --trials <scratch.json> --prior benchmarks/<artifact-name>.json --artifact <path>` returns per-eval mean/std-dev, flaky and discrimination flags, deltas vs the prior run, and a gate verdict. If it **cannot run** (no `node`, script missing, usage error), report the raw per-trial results with `⚠ no aggregate — validator unavailable: <reason>` and do not hand-compute a gate verdict; a gate verdict is a claim about statistical significance and must not be estimated. A verdict of FAIL always blocks.
- **Persist** — save the returned payload to `benchmarks/<artifact-name>.json` (committed) as the new trend baseline.
- **Report** — Phase 5 table with mean±std-dev columns plus the gate verdict. On gate fail, verdict is "regressed — not ready".

---

## NEVER

- **NEVER spawn a trial's with_artifact and baseline runs sequentially**
  **Instead:** Both arms of each trial in the same message. In benchmark mode, all N trial-pairs for one eval go in one message; different evals may batch sequentially.
  **Why:** Sequential arms serialize parallel feedback; but spawning every eval's trials at once floods notifications and makes per-arrival `<usage>` capture unreliable.

- **NEVER defer usage capture until other runs complete**
  **Instead:** Read each notification's `<usage>` block (`duration_ms`, `subagent_tokens`) the moment it arrives.
  **Why:** The `<usage>` data exists only at notification time and cannot be reconstructed afterward.

- **NEVER report a single trial as a benchmark**
  **Instead:** Run at least N=3 trials so mean and std-dev are meaningful.
  **Why:** A lone pass_rate looks precise but hides flakiness — a skill that truly passes a third of the time can read 100% or 0% on one trial.

- **NEVER weaken a scenario that a with-artifact run failed**
  **Instead:** Strengthen the body until the run passes the scenario as written.
  **Why:** The scenario is the record of a real failure. Softening it makes the eval green while the failure it was built to catch survives untouched.

- **NEVER tune a description against the held-out trigger queries**
  **Instead:** Iterate on the train split; look at held-out only to select the final version.
  **Why:** A description tuned against its own test set scores well and generalizes worse — you lose the only unbiased estimate you had.

- **NEVER write subjective assertions** ("output is clear", "well-formatted", "thorough")
  **Instead:** Verifiable from the text: "output includes 'Phase 1' heading", "no NEVER rule missing a WHY clause"
  **Why:** Subjective assertions give the assayer no ground truth; pass/fail becomes arbitrary and unrepeatable.

- **NEVER use different prompts for the with and baseline runs**
  **Instead:** Identical prompt — only the artifact instruction differs.
  **Why:** Prompt variation confounds the delta; it measures prompt quality, not artifact effect.

- **NEVER accept assayer output with non-standard field names**
  **Instead:** Require `text`, `passed`, `evidence` exactly — reject `name`, `met`, `details`, or others.
  **Why:** Phase 5 aggregation depends on exact field names; silently wrong names produce wrong pass_rates.
