---
name: ai-forge-audit
description: "Batch-evaluate all skills and agents in the repo with ai-forge-judge and render a single consolidated grade report sorted by grade (worst first) so effort is directed correctly. Use when reviewing overall skill/agent quality, finding where to invest improvement effort, or after bulk changes. Triggers are audit all skills, grade report, skill health check, where to focus, audit agents. Don't use for a single artifact — that's ai-forge-judge."
---

# AI Forge Audit

Batch-run ai-forge-judge across every skill and agent in the repo. One consolidated report — grades, top issues, priority order. Read-only: no fixes applied.

Requires the `ai-forge-judge` skill. If it is not available in this environment (no `ai-forge-judge` under any platform's `skills/` root, and invoking it fails), stop: "ai-forge-judge skill not found — install it before running audit."

---

## Workflow

### Phase 0 — Coherence

Run before grading anything:

```sh
node scripts/check-ecosystem.cjs --roots <comma-separated roots>
```

`check-ecosystem.cjs` is local and read-only: it only reads files under the given roots and writes a JSON report to stdout — no network access, no subprocess spawning, no writes outside stdout.

It returns JSON with `errors` and `warnings` across six roster-level checks that no per-artifact grade can see: trigger collisions (description keyword overlap), duplicate and shadowed names, name/directory mismatches, stale reference links, orphaned reference files, dated model pins, and body word budgets.

These are properties of the roster, not of any single artifact. Eight skills can each score an A while two of them compete for every trigger and a third points at a file someone deleted.

Render the findings as an `## Ecosystem` section above the grade summary. If the script is missing or errors, head the section with `⚠ roster-level checks skipped — validator unavailable: <reason>` and continue to Phase 1 — coherence is additive, not a gate, but its absence must be visible, since these checks are exactly what per-artifact grades cannot see.

### Phase 1 — Discover

Discovery is **platform-agnostic** — scan every platform's roots, not just Claude's. Two constraints shape how:

- **Glob excludes hidden directories.** A pattern naming `.claude/…` from the repo root matches nothing; you MUST pass `path` pointing *inside* each root.
- **Agent extensions differ by platform.** Skills are always `SKILL.md`; agents are `.md`, `.agent.md`, or `.toml`.

For each root below, Glob with the listed `path` + `pattern`. A root that doesn't exist raises a `Directory does not exist` error — treat that as "no artifacts under this root" and continue to the next; it is not a failure. Conventions mirror the Platform Detection table in [`ai-forge-create/references/agents-taxonomy.md`](../ai-forge-create/references/agents-taxonomy.md).

**Skills** — `pattern: */SKILL.md` for each `path`:
`.claude/skills` · `.github/skills` · `.codex/skills` · `.gemini/skills` · `.agents/skills`

**Agents** — `path` and `pattern` per platform:

| path | pattern |
|------|---------|
| `.claude/agents` | `*.md` |
| `.github/agents` | `*.agent.md` |
| `.codex/agents` | `*.toml` |
| `.gemini/agents` | `*.md` |

The artifact name is the match's parent directory (skills) or file stem (agents). `.agents/skills` is a cross-tool alias for `.gemini/skills` — if a name appears under both, count it once (`.agents/` wins). When the same skill name exists under two *different* platforms, report each separately, labelled by platform.

If zero artifacts found across all roots: output "No skills or agents found." and stop.

### Phase 2 — Evaluate

For each discovered artifact, sequentially (do not parallelize — parallel evaluation risks context overflow and makes progress unreadable):

1. Invoke `ai-forge-judge` on it.
2. From the judge output, extract and record:
   - Artifact name
   - Type (Skill / Agent)
   - Grade (A/B/C/D/F)
   - Score (X/Y, Z%)
   - Numbered Improvements: up to 5 items (prefer compounding improvements — fixing X enables Y to score higher; deprioritize cosmetic when structural issues exist)

Emit a one-line status per artifact as each evaluation completes:

```text
✓ ai-forge-create     B  (87/120, 73%)  [Skill]
✓ writer              A  (108/120, 90%)  [Agent]
✓ ai-forge-apply      C  (74/120, 62%)  [Skill]
```

If N > 10: output "About to run N evaluations — this may take several minutes. Proceed? (y/n)" and stop if denied.

If an artifact's judge run errors: record `ERR` and the error message; continue to the next. Do not abort.

### Phase 3 — Render Report

Sort results by grade ascending: F → D → C → B → A. Worst grades appear first.

Split artifacts into two groups:

- **Needs Work**: grade below B (< 80%)
- **Passing**: grade B or above (≥ 80%)

Output a single markdown report:

````markdown
# AI Forge Audit
_<YYYY-MM-DD> — <N> artifacts evaluated (<S> skills, <A> agents)_

## Ecosystem

| Check | Artifacts | Finding |
|-------|-----------|---------|
| trigger_collision | ai-forge-X, ai-forge-Y | keyword overlap 0.52 — compete for the same triggers |
| stale_reference | ai-forge-Z | links `references/gone.md` but the file does not exist |

_No ecosystem issues found._ ← when clean

## Grade Summary

| Artifact | Type | Grade | Score |
|----------|------|-------|-------|
| ai-forge-X | Skill | F | 55/120 (46%) |
| writer | Agent | C | 78/120 (65%) |
| ai-forge-Z | Skill | B | 98/120 (82%) |

## Needs Work

### ai-forge-X — F (55/120, 46%) [Skill]

1. <improvement 1 from judge>
2. <improvement 2>
3. <improvement 3>

### writer — C (78/120, 65%) [Agent]

1. <improvement 1>
2. <improvement 2>

## Passing (B+)

| Artifact | Type | Grade | Score |
|----------|------|-------|-------|
| ai-forge-Z | Skill | B | 98/120 (82%) |

## Skipped

| Artifact | Reason |
|----------|--------|
| some-dir | No SKILL.md found |
````

If all artifacts pass: omit the "Needs Work" section.
If no artifacts pass: omit the "Passing" section.
If nothing was skipped: omit the "Skipped" section.

---

## NEVER

- **NEVER display full judge reports inline for each artifact**
  **Instead:** Extract only grade, score, and top 1–5 numbered improvements per artifact.
  **Why:** Unfiltered judge output for 6+ artifacts floods the context window.

- **NEVER apply any fixes during an audit run**
  **Instead:** Output the report only. Direct the user to `ai-forge-apply` or `ai-forge-update` for remediation.
  **Why:** Mixing diagnosis with treatment makes it impossible to know what the baseline was.

- **NEVER report per-artifact grades without the coherence pass**
  **Instead:** Run Phase 0 first and render its findings above the grade summary.
  **Why:** Grades are per-artifact by construction. A roster where every skill scores A can still be unroutable because two descriptions compete, and no grade will ever show it.

- **NEVER sort by name or alphabetically**
  **Instead:** Sort by grade ascending (F first, A last) within each section.
  **Why:** Alphabetical sort buries the worst artifacts; the report's job is to surface where effort is needed most.

- **NEVER abort the audit when a single artifact errors**
  **Instead:** Record `ERR` for that artifact and continue to the next.
  **Why:** A failed judge run on one artifact should not discard results already collected for others.
