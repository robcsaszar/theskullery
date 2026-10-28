#!/usr/bin/env node
/**
 * Aggregates benchmark trial results into a benchmark.json payload.
 * Usage:
 *   node scripts/aggregate-benchmark.cjs --trials <trials.json> --artifact <path>
 *     [--prior <benchmark.json>] [--min-pass-rate 0.8] [--max-flaky-std 0.2]
 *     [--max-regression 0.1]
 *
 * Reads a trial-results JSON (schema in references/benchmarking.md), computes per-eval
 * mean/std-dev per arm, flaky flags, deltas vs a prior run (guarded by artifact hash),
 * and a gate verdict. Prints the new benchmark.json payload to stdout.
 *
 * Exits 0 on success (payload to stdout), 1 on failure (errors to stderr). Zero dependencies.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto');

const argv = process.argv.slice(2);
function arg(flag, fallback = null) {
  const i = argv.indexOf(flag);
  return i !== -1 ? argv[i + 1] : fallback;
}
function numArg(flag, fallback) {
  const v = arg(flag);
  return v === null ? fallback : Number(v);
}

const trialsPath = arg('--trials');
const artifactPath = arg('--artifact');
const priorPath = arg('--prior');
const MIN_PASS_RATE = numArg('--min-pass-rate', 0.8);
const MAX_FLAKY_STD = numArg('--max-flaky-std', 0.2);
const MAX_REGRESSION = numArg('--max-regression', 0.1);

if (!trialsPath || !artifactPath) {
  process.stderr.write(
    'Usage: node aggregate-benchmark.cjs --trials <trials.json> --artifact <path> [--prior <benchmark.json>]\n',
  );
  process.exit(1);
}

// ── Read inputs ───────────────────────────────────────────────────────────────

function readJson(path, label) {
  let raw;
  try {
    raw = fs.readFileSync(path, 'utf8');
  } catch (e) {
    process.stderr.write(`${label} ERROR: cannot read ${path} — ${e.message}\n`);
    process.exit(1);
    return undefined;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    process.stderr.write(`${label} ERROR: invalid JSON in ${path} — ${e.message}\n`);
    process.exit(1);
    return undefined;
  }
}

const trials = readJson(trialsPath, 'TRIALS');

let artifactContent;
try {
  artifactContent = fs.readFileSync(artifactPath, 'utf8');
} catch (e) {
  process.stderr.write(`ARTIFACT ERROR: cannot read ${artifactPath} — ${e.message}\n`);
  process.exit(1);
}
const artifactHash = `sha256:${crypto.createHash('sha256').update(artifactContent).digest('hex')}`;

let prior = null;
if (priorPath && fs.existsSync(priorPath)) {
  prior = readJson(priorPath, 'PRIOR');
}
const artifactChanged = prior !== null && prior.artifact_hash !== artifactHash;

// ── Stats helpers ─────────────────────────────────────────────────────────────

function stats(nums) {
  const vals = nums.filter(n => n !== null && n !== undefined);
  if (vals.length === 0) return { mean: null, std: 0 };
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (vals.length < 2) return { mean, std: 0 };
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / (vals.length - 1);
  return { mean, std: Math.sqrt(variance) };
}
const round = (n, p = 3) => (n === null ? null : Number(n.toFixed(p)));

function armStats(armTrials) {
  const pr = stats(armTrials.map(t => t.pass_rate));
  const tok = stats(armTrials.map(t => t.tokens));
  const dur = stats(armTrials.map(t => t.duration_ms));
  return {
    pass_rate_mean: round(pr.mean),
    pass_rate_std: round(pr.std),
    tokens_mean: round(tok.mean, 0),
    duration_ms_mean: round(dur.mean, 0),
  };
}

// ── Assertion discrimination ──────────────────────────────────────────────────
// Optional: when trials carry per-assertion results (`expectations: [{text, passed}]`),
// classify each assertion by how it behaves across both arms. Pass rate alone cannot
// distinguish an assertion that measures the artifact from one that measures the model.

function classifyAssertions(evalTrials) {
  const byText = new Map();

  for (const t of evalTrials) {
    // eslint-disable-next-line no-continue
    if (!Array.isArray(t.expectations)) continue;
    for (const e of t.expectations) {
      // eslint-disable-next-line no-continue
      if (!e || typeof e.text !== 'string') continue;
      if (!byText.has(e.text)) byText.set(e.text, { with_artifact: [], baseline: [] });
      const bucket = byText.get(e.text)[t.arm];
      if (bucket) bucket.push(e.passed === true);
    }
  }

  const out = [];
  for (const [text, arms] of byText) {
    // eslint-disable-next-line no-continue
    if (arms.with_artifact.length === 0 || arms.baseline.length === 0) continue;

    const rate = a => a.filter(Boolean).length / a.length;
    const w = rate(arms.with_artifact);
    const b = rate(arms.baseline);
    const mixed = a => a.some(Boolean) && !a.every(Boolean);

    let verdict;
    if (mixed(arms.with_artifact) || mixed(arms.baseline)) {
      verdict = 'flaky';
    } else if (w === 1 && b === 1) {
      verdict = 'non_discriminating';
    } else if (w === 0 && b === 0) {
      verdict = 'broken_or_unreachable';
    } else if (w === 1 && b === 0) {
      verdict = 'discriminating';
    } else if (w === 0 && b === 1) {
      verdict = 'artifact_hurting';
    } else {
      verdict = 'flaky';
    }

    out.push({
      text,
      with_pass_rate: round(w),
      baseline_pass_rate: round(b),
      verdict,
    });
  }
  return out;
}

const VERDICT_NOTE = {
  non_discriminating: 'passes in both arms — measures the model, not the artifact',
  broken_or_unreachable: 'fails in both arms — broken assertion or beyond model capability',
  artifact_hurting: 'passes without the artifact but fails with it',
  flaky: 'inconsistent across trials — tighten the wording',
};

// ── Per-eval aggregation ──────────────────────────────────────────────────────

if (!Array.isArray(trials.evals) || trials.evals.length === 0) {
  process.stderr.write('TRIALS ERROR: no evals in trial-results JSON\n');
  process.exit(1);
}

const priorEvals = new Map(
  (prior && prior.evals ? prior.evals : []).map(e => [e.eval_id, e]),
);

const failures = [];
const regressions = [];

const evals = trials.evals.map((ev) => {
  const withArm = ev.trials.filter(t => t.arm === 'with_artifact');
  const baseArm = ev.trials.filter(t => t.arm === 'baseline');
  const withStats = armStats(withArm);
  const baseStats = armStats(baseArm);
  const deltaMean = withStats.pass_rate_mean !== null && baseStats.pass_rate_mean !== null
    ? round(withStats.pass_rate_mean - baseStats.pass_rate_mean)
    : null;
  const flaky = withStats.pass_rate_std > MAX_FLAKY_STD;

  // Absolute-threshold gates (always apply)
  if (withStats.pass_rate_mean !== null && withStats.pass_rate_mean < MIN_PASS_RATE) {
    failures.push(
      `eval ${ev.eval_id}: pass_rate ${withStats.pass_rate_mean} < min ${MIN_PASS_RATE}`,
    );
  }
  if (flaky) {
    failures.push(
      `eval ${ev.eval_id}: flaky (std ${withStats.pass_rate_std} > ${MAX_FLAKY_STD})`,
    );
  }

  // Regression vs prior — only meaningful for the same artifact
  const priorEval = priorEvals.get(ev.eval_id);
  if (priorEval && priorEval.with_artifact && withStats.pass_rate_mean !== null) {
    const drop = round(priorEval.with_artifact.pass_rate_mean - withStats.pass_rate_mean);
    if (drop > MAX_REGRESSION) {
      regressions.push(`eval ${ev.eval_id}: pass_rate down ${drop} vs prior`);
      if (!artifactChanged) {
        failures.push(`eval ${ev.eval_id}: regressed ${drop} > ${MAX_REGRESSION} vs prior`);
      }
    }
  }

  // Per-assertion discrimination (only when trials carry expectations)
  const assertions = classifyAssertions(ev.trials);
  for (const a of assertions) {
    if (a.verdict === 'artifact_hurting') {
      failures.push(
        `eval ${ev.eval_id}: assertion "${a.text}" passes without the artifact but fails with it`,
      );
    }
  }

  return {
    eval_id: ev.eval_id,
    with_artifact: withStats,
    baseline: baseStats,
    delta_mean: deltaMean,
    flaky,
    ...(assertions.length ? { assertions } : {}),
  };
});

// Roster-level roll-up of assertions that are not earning their place.
const assertionWarnings = [];
for (const ev of evals) {
  for (const a of ev.assertions ?? []) {
    if (a.verdict !== 'discriminating' && VERDICT_NOTE[a.verdict]) {
      assertionWarnings.push(`eval ${ev.eval_id}: "${a.text}" — ${VERDICT_NOTE[a.verdict]}`);
    }
  }
}

// ── Summary + payload ─────────────────────────────────────────────────────────

const withMeans = evals.map(e => e.with_artifact.pass_rate_mean).filter(n => n !== null);
const baseMeans = evals.map(e => e.baseline.pass_rate_mean).filter(n => n !== null);
const avg = a => (a.length ? round(a.reduce((x, y) => x + y, 0) / a.length) : null);
const withAvg = avg(withMeans);
const baseAvg = avg(baseMeans);

const payload = {
  artifact: trials.artifact,
  artifact_hash: artifactHash,
  timestamp: new Date().toISOString(),
  n_trials: trials.n_trials,
  thresholds: {
    min_pass_rate: MIN_PASS_RATE,
    max_flaky_std: MAX_FLAKY_STD,
    max_regression: MAX_REGRESSION,
  },
  evals,
  summary: {
    with_pass_rate_mean: withAvg,
    baseline_pass_rate_mean: baseAvg,
    delta_mean: withAvg !== null && baseAvg !== null ? round(withAvg - baseAvg) : null,
  },
  gate: { passed: failures.length === 0, failures },
  assertion_warnings: assertionWarnings,
  comparison: {
    prior_timestamp: prior ? prior.timestamp : null,
    artifact_changed: artifactChanged,
    regressions,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exit(0);
