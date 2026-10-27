#!/usr/bin/env node
/**
 * Roster-level coherence checks across a collection of skills and agents.
 *
 * Per-artifact grading (ai-forge-judge) cannot see these: every skill in a roster can
 * score an A while two of them compete for the same triggers, a MANDATORY READ points
 * at a deleted file, or a reference file is never loaded by anything.
 *
 * Usage:
 *   node scripts/check-ecosystem.cjs [--roots <dir>[,<dir>...]] [--threshold 0.4] [--strict]
 *
 * Default roots cover every platform convention:
 *   .claude/skills .github/skills .codex/skills .gemini/skills .agents/skills skills
 *
 * Output: JSON report on stdout.
 * Exit: 0 normally (or warnings only); 10 with --strict when errors exist;
 *       1 on unreadable input; 2 on invalid arguments.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// ── Arguments ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function arg(flag, fallback = null) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] !== undefined ? args[i + 1] : fallback;
}

const DEFAULT_ROOTS = [
  '.claude/skills',
  '.github/skills',
  '.codex/skills',
  '.gemini/skills',
  '.agents/skills',
  'skills',
];

const roots = (arg('--roots') ?? DEFAULT_ROOTS.join(',')).split(',').map(s => s.trim()).filter(Boolean);
const strict = args.includes('--strict');

const threshold = Number(arg('--threshold', '0.4'));
if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) {
  process.stderr.write(`ARGUMENT ERROR: --threshold must be a number in (0, 1] — got '${arg('--threshold')}'.\n`);
  process.exit(2);
}

const WORD_BUDGET = Number(arg('--word-budget', '1800'));
if (!Number.isFinite(WORD_BUDGET) || WORD_BUDGET <= 0) {
  process.stderr.write('ARGUMENT ERROR: --word-budget must be a positive number.\n');
  process.exit(2);
}

// ── Discovery ─────────────────────────────────────────────────────────────────

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null; // a root that doesn't exist is "no artifacts here", not a failure
  }
}

const artifacts = [];

for (const root of roots) {
  const entries = safeReaddir(root);
  // eslint-disable-next-line no-continue
  if (!entries) continue;

  for (const entry of entries) {
    // eslint-disable-next-line no-continue
    if (!entry.isDirectory()) continue;
    const dir = path.join(root, entry.name);
    const skillFile = path.join(dir, 'SKILL.md');
    // eslint-disable-next-line no-continue
    if (!fs.existsSync(skillFile)) continue;

    let raw;
    try {
      raw = fs.readFileSync(skillFile, 'utf8');
    } catch (e) {
      process.stderr.write(`READ ERROR: ${skillFile} — ${e.message}\n`);
      process.exit(1);
    }

    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const frontmatter = fm ? fm[1] : '';
    const body = fm ? raw.slice(fm[0].length) : raw;

    const nameMatch = frontmatter.match(/^name:\s*["']?(.+?)["']?\s*$/m);
    const descMatch = frontmatter.match(/^description:\s*["']?([\s\S]*?)["']?\s*$/m);

    artifacts.push({
      dir,
      root,
      file: skillFile,
      dirName: entry.name,
      name: nameMatch ? nameMatch[1].trim() : entry.name,
      description: descMatch ? descMatch[1].trim() : '',
      frontmatter,
      body,
      words: body.split(/\s+/).filter(Boolean).length,
    });
  }
}

const errors = [];
const warnings = [];

// ── 1. Trigger collision (description keyword overlap) ────────────────────────

const STOPWORDS = new Set(
  ('a an and are as at be by don dont for from has have in is it its not of on or that the this to '
    + 'use used uses using when where which who with without will would can could should may might '
    + 'run runs running via into onto over under before after each every any all some other others '
    + 'trigger triggers phrases skill skills agent agents file files').split(' '),
);

function keywords(text) {
  return new Set(
    (text.toLowerCase().match(/\b[a-z][a-z0-9-]{2,}\b/g) ?? []).filter(w => !STOPWORDS.has(w)),
  );
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const w of a) if (b.has(w)) shared += 1;
  return shared / (a.size + b.size - shared);
}

const kw = new Map(artifacts.map(a => [a.dir, keywords(a.description)]));

for (let i = 0; i < artifacts.length; i += 1) {
  for (let j = i + 1; j < artifacts.length; j += 1) {
    const a = artifacts[i];
    const b = artifacts[j];
    const score = jaccard(kw.get(a.dir), kw.get(b.dir));
    if (score >= threshold) {
      warnings.push({
        check: 'trigger_collision',
        artifacts: [a.name, b.name],
        detail:
          `description keyword overlap ${score.toFixed(2)} (>= ${threshold}) — `
          + 'these compete for the same triggers; differentiate them or add negative triggers',
      });
    }
  }
}

// ── 2. Duplicate and shadowed names ───────────────────────────────────────────

const byName = new Map();
const byNormalized = new Map();
const normalize = n => n.toLowerCase().replace(/[-_\s]/g, '');

for (const a of artifacts) {
  if (!byName.has(a.name)) byName.set(a.name, []);
  byName.get(a.name).push(a);

  const norm = normalize(a.name);
  if (!byNormalized.has(norm)) byNormalized.set(norm, new Set());
  byNormalized.get(norm).add(a.name);
}

for (const [name, list] of byName) {
  if (list.length > 1) {
    warnings.push({
      check: 'duplicate_name',
      artifacts: [name],
      detail:
        `'${name}' appears in ${list.length} locations (${list.map(a => a.root).join(', ')}) — `
        + 'only the highest-priority copy is routable; the rest are silently shadowed',
    });
  }
}

for (const [, names] of byNormalized) {
  if (names.size > 1) {
    warnings.push({
      check: 'near_duplicate_name',
      artifacts: [...names],
      detail: 'names are identical after removing separators — easy to confuse and likely to split triggers',
    });
  }
}

// ── 3. Name / directory mismatch ──────────────────────────────────────────────

for (const a of artifacts) {
  if (a.name !== a.dirName) {
    errors.push({
      check: 'name_directory_mismatch',
      artifacts: [a.name],
      detail: `frontmatter name '${a.name}' does not match directory '${a.dirName}' — the skill will not resolve`,
    });
  }
}

// ── 4. Stale and orphaned references ──────────────────────────────────────────

// Two different questions need two different patterns.
//
// LINKED  — markdown link targets. These are declarations: the body promises the file is
//           there, so a miss is an error. Prose that merely mentions a path (an illustrative
//           `references/bash.md`, or a file the *authored* skill will create) is not a promise
//           and must not be matched, or every example becomes a false positive.
// MENTION — any occurrence in any form. Enough to make a reference discoverable, so it is the
//           right test for orphans.
const LINKED_PATTERN = /\]\((\.{0,2}\/?(?:[A-Za-z0-9._-]+\/)*(?:references|scripts|assets|agents|evals)\/[A-Za-z0-9._\-/]+)\)/g;
const MENTION_PATTERN = /(?:^|[\s(`["])((?:references|scripts|assets|agents|evals)\/[A-Za-z0-9._\-/]+)/g;

for (const a of artifacts) {
  const linked = new Set();
  for (const m of a.body.matchAll(LINKED_PATTERN)) {
    linked.add(m[1].replace(/[).,`]+$/, ''));
  }

  const mentioned = new Set(linked);
  for (const m of a.body.matchAll(MENTION_PATTERN)) {
    mentioned.add(m[1].replace(/[).,`]+$/, ''));
  }

  // Stale: linked from the body but absent on disk
  for (const rel of linked) {
    if (!fs.existsSync(path.join(a.dir, rel))) {
      errors.push({
        check: 'stale_reference',
        artifacts: [a.name],
        detail: `SKILL.md links '${rel}' but the file does not exist`,
      });
    }
  }

  // Orphaned: present on disk under references/ but never named
  const refDir = path.join(a.dir, 'references');
  const refEntries = safeReaddir(refDir);
  if (refEntries) {
    for (const f of refEntries) {
      // eslint-disable-next-line no-continue
      if (!f.isFile()) continue;
      const rel = `references/${f.name}`;
      if (!mentioned.has(rel)) {
        warnings.push({
          check: 'orphaned_reference',
          artifacts: [a.name],
          detail: `'${rel}' exists but no MANDATORY READ or link in SKILL.md points at it — it will never load`,
        });
      }
    }
  }
}

// ── 5. Pinned dated model IDs ─────────────────────────────────────────────────

const DATED_MODEL = /\b(?:claude|gpt|gemini)[a-z0-9.-]*-\d{8}\b/i;

for (const a of artifacts) {
  const hit = a.frontmatter.match(DATED_MODEL);
  if (hit) {
    errors.push({
      check: 'pinned_model',
      artifacts: [a.name],
      detail: `frontmatter pins dated model ID '${hit[0]}' — use a family alias or omit; dated IDs are deprecated on a schedule the skill does not control`,
    });
  }
}

// ── 6. Body word budget ───────────────────────────────────────────────────────

for (const a of artifacts) {
  if (a.words > WORD_BUDGET) {
    warnings.push({
      check: 'word_budget',
      artifacts: [a.name],
      detail: `SKILL.md body is ${a.words} words (budget ${WORD_BUDGET}) — the whole body loads on every invocation; move depth to references/`,
    });
  }
}

// ── Output ────────────────────────────────────────────────────────────────────

const report = {
  roots_scanned: roots,
  artifacts_found: artifacts.length,
  artifacts: artifacts.map(a => ({ name: a.name, root: a.root, words: a.words })),
  thresholds: { collision_jaccard: threshold, word_budget: WORD_BUDGET },
  errors,
  warnings,
  summary: {
    errors: errors.length,
    warnings: warnings.length,
    healthy: errors.length === 0 && warnings.length === 0,
  },
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (strict && errors.length > 0) process.exit(10);
process.exit(0);
