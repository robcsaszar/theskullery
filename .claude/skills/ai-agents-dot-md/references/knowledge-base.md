# AGENTS.md Knowledge Base

---

## Empirical Facts

- **Optimal size**: 100–150 line AGENTS.md + focused reference docs = 10–15% cross-metric improvement in mid-size modules (~100 core files)
- **Diminishing returns**: Beyond 150 lines, gains reverse — longer files actively hurt
- **Progressive disclosure**: Top performer pattern. Keep common workflows high-level in AGENTS.md, push details into reference files
- **Procedural workflows**: Strongest single pattern measured. Correctness +25%, completeness +20%. Numbered multi-step workflows move agents from "unable to complete" to "correct on first try"
- **Decision tables**: 25% improvement on `best_practices` metric. Resolve ambiguity before the agent writes code
- **Real code examples**: 3–10 lines from actual production code improve reuse. More than that → agent pattern-matches on the wrong thing
- **"Don't" + "Do" pairing**: Warning-only docs consistently underperform. 15+ sequential "don'ts" with no "dos" → overexploration, conservative behavior, less work done
- **Discovery rates**: AGENTS.md = 100% discovery. References from AGENTS.md = 90%+. Directory README = 80%+. Nested READMEs = 40%. Orphan docs = <10%
- **Module-level > repo-root**: Module-specific AGENTS.md outperforms cross-cutting repo-root files
- **Overexploration trap**: Too much architecture overview or excessive warnings → agent reads dozens of docs, loads 100K+ tokens, output quality drops
- LLM-generated context files **reduce** agent task success rates and increase inference cost by 20%+
- Developer-written files: marginal +4% improvement, only when minimal and precise
- **Unnecessary requirements actively harm agent performance** because agents follow them faithfully, broadening exploration
- Agents "default to non-interactive behavior without explicit encouragement"
- Contradictory priorities without explicit ordering → agent skips verification and rushes

---

## Core Principles

### 1. Minimal by Design

If a constraint can be expressed elsewhere (linter, type checker, CI gate), it must NOT live in AGENTS.md. The tool IS the constraint.

### 2. Toolchain First

Correct: `Lint: \`pnpm lint\` (Biome — see biome.json)`
Wrong: A list of what Biome enforces.

### 3. Pink Elephant Problem (Context Anchoring)

Telling an agent what NOT to do keeps the concept active in attention. Saying "do not use tRPC" makes tRPC highly active. Better: fix the underlying ambiguity (delete the legacy code, add a linter rule) and then delete the instruction.

A prohibition earns its place only as a hard guardrail with no positive phrasing — and even then, pair it with the target behaviour so attention lands on what to do, not on the banned thing.

### 4. Command-First

Instructions without verification commands are suggestions, not rules. Every instruction should answer: "What command proves this was done correctly?"

### 5. Closure Definitions

Define "done" as specific exit codes, not feelings. Without explicit closure, "done" means "I think I'm done." See **Completion Criteria** below for the two properties that make a closure line actually bind.

### 6. Task-Organized Sections

"When Writing Code / When Reviewing / When Releasing" > flat categorized lists. The "When…" prefix maps to how agents reason about task context.

---

## The Two Loads

Every line in AGENTS.md, and every file it points to, spends one of two budgets:

- **Context load** — the cost of always-loaded material. AGENTS.md is read at the start of every session, so each line costs tokens and attention on every task whether or not it applies. This is the budget the 150-line limit protects.
- **Cognitive load** — the cost on the human of remembering which documents exist and when to reach for each. Not a cost to drive to zero: it is the price of human judgement. Spend it where a human should decide; remove it where they shouldn't have to.

Material reached only through a pointer escapes context load at the price of the pointer's own line. Material with no pointer at all rides entirely on the human remembering it — which for an agent means it effectively doesn't exist (orphan docs: <10% discovery).

---

## Information Hierarchy

AGENTS.md content is either **steps** (ordered actions: build, test, release) or **reference** (rules, facts, boundaries consulted on demand). Each piece sits on a ladder ranked by how immediately the agent needs it:

1. **In-file step** — what the agent does, in order. The primary tier.
2. **In-file reference** — consulted on demand. A flat set of peer rules (the NEVER/ASK/ALWAYS tiers) is a fine shape here, not a smell.
3. **Disclosed reference** — pushed into a separate file, reached by a pointer, loaded only when the pointer fires.

Push too little down and the top bloats; push too much and you hide material the agent actually needs. That tension is the whole decision.

**The branch test** is the cleanest way to decide: inline what every task needs; push behind a pointer what only some tasks reach. Release steps, migration rules, and single-package quirks are branch-only — they belong in a referenced file, not in a root AGENTS.md that every session loads.

**Co-location** is the within-file companion. Keep a concept's definition, rules, and caveats under one heading, so reading one part brings its neighbours with it. Scattering (one rule's exceptions three sections away from the rule) is distinct from duplication: duplication repeats one meaning in two places; scattering fragments one meaning across many.

**Sprawl** is the failure mode: a file that is simply too long even when every line is live and unique. Attention thins across the excess. The cure is the ladder — disclose branch-only reference behind pointers and split by task so each path carries only what it needs.

---

## Context Pointers

A **pointer** is a line in AGENTS.md that names some out-of-file material and encodes the condition for reaching it. Its *wording*, not its target, decides whether the agent ever opens the target — and how reliably. A must-read doc behind a weakly worded pointer is a reliability bug: sharpen the wording first, and inline the material only if sharpening fails.

A pointer does two jobs: say what the material is, and name the **trigger** — the distinct situation in which the agent should reach it. Rules:

- **Trigger first.** `Before editing anything under db/, read docs/migrations.md` — the leading words do the work. `See docs/migrations.md for database notes` is read and forgotten.
- **One trigger per branch.** Synonyms that rename the same situation are one trigger written twice; collapse them.
- **Cut what the target already carries.** The pointer doesn't need to summarise the doc; it needs to fire at the right moment.

| Weak pointer | Strong pointer |
|---|---|
| `See docs/deploy.md` | `Before any release step, read docs/deploy.md` |
| `Testing conventions are in TESTING.md` | `When adding or changing a test, follow TESTING.md` |
| `More info in the wiki` | (delete — no trigger, no reachable target) |

---

## Completion Criteria

Every step, and every ALWAYS rule, ends on a completion criterion — the condition that tells the agent the work is done. Two properties make it bind:

- **Clarity** — can the agent tell done from not-done? A vague bound ("tests updated as needed") invites **premature completion**: the agent ends the step early because attention has already slipped to the next visible step. The later steps supply the pull; the criterion's clarity is the resistance. Fix by sharpening the bound (`all exit 0: lint, typecheck, test`) — cheap and local. Only if the bound is irreducibly fuzzy *and* you observe the rush should you hide later steps by splitting the workflow across a real hand-off.
- **Demand** — how much it requires. `Every changed model has a migration and a test` forces exhaustive work where `produce a change list` does not. Demand is what drives the digging the agent does inside a step; it lives in the wording of the criterion, not as its own instruction. It is not step-bound either: `every rule below applied` binds a flat list of rules the same way `every step done` binds a sequence.

The strongest criteria are both checkable and exhaustive: a command that exits 0, over a scope stated as "every X".

---

## Leading Words

A **leading word** is a compact, already-familiar concept the agent thinks with while following the file (*gate*, *green*, *blocked*, *dry run*). Repeated as the same token — never re-explained as a sentence — it accumulates a shared meaning across the file and anchors a whole region of behaviour in the fewest tokens. Reach for an existing word first: a coined term recruits no prior knowledge, so you pay in definition lines what a familiar word gives for free.

It anchors twice. In the body: the agent reaches for the same behaviour every time the word appears, and inside a flat rule list it focuses attention on a class of thing to look for. In a pointer: when the same word appears in your prompts, your docs, and your code, the agent links that shared language to the material and reaches it more reliably.

Hunt for restatements to collapse. A triad spelled out at three sites, a sentence gesturing at one idea — each is a passage begging to become a single repeated word:

- "fast, deterministic, no network calls" → *hermetic* (a *hermetic* test)
- "lint, typecheck, and tests all pass" → *green* (the branch is *green*)

The strength of the word matters. *Be thorough* when the agent is already thorough-ish changes nothing — it is a no-op. The fix is a stronger word (*exhaustive*), not a different technique.

---

## Pruning

- **Single source of truth.** Each meaning lives in one authoritative place, so changing the behaviour is a one-place edit. Duplication — the same meaning in two places — costs maintenance and tokens, and inflates that meaning's prominence past its real rank. (The accidental inverse of a leading word, which repeats a *token* on purpose, never the meaning.)
- **The environment is a source of truth.** `package.json` scripts, config files, directory layout, `--help` output. A line in AGENTS.md that restates them is a **cache**: a copy of a lookup, worth its cost only when the lookup is expensive. Cache what the agent cannot find by looking — the unwritten convention, the reason behind a choice, the gotcha no config confesses. Leave the one-file, one-command lookups to the environment, where they cannot go stale.
- **Relevance.** Check every line: does it still bear on what the agent does here? A line loses relevance by never bearing on the task (exposition; a branch that should be disclosed) or by going stale as the code or the world changes. Without a pruning discipline the default fate is **sediment**: stale layers that settle because adding feels safe and removing feels risky, until someone has to core down through them to find what is still live.
- **The no-op test.** Sentence by sentence: does this change behaviour versus what the agent does by default? An instruction the model already obeys pays load to say nothing. The test is model-relative, not reader-relative: two people disagreeing about a no-op disagree about the default, and settle it by running the file, not by debate. When a sentence fails, delete the whole sentence rather than trim words from it.

---

## What Gets Ignored (Empirically Proven)

| Pattern | Why It Fails |
|---------|-------------|
| Prose paragraphs without commands | No actionable instruction, no verification mechanism |
| Ambiguous directives ("be careful", "optimize where possible") | Not a constraint, not a trigger condition, not a behavior spec |
| Contradictory priorities without ordering | Agent can't satisfy all simultaneously → skips verification |
| Style guides without enforcement commands | No mechanism to verify compliance = suggestion, not rule |
| Architecture overviews | Pulls agent into reading dozens of docs (overexploration) |
| 15+ warnings without alternatives | Agent over-explores, stays conservative, does less work |
| Bare pointers ("see X.md") | No trigger, so the agent never has a reason to open the file |
| No-op instructions | Restate the default; spend attention, change nothing |

---

## What Works (Empirically Proven)

| Pattern | Effect | Example |
|---------|--------|---------|
| Command-first instructions | Unambiguous, verifiable by exit code | `Test: \`pytest -v --tb=short\`` |
| Closure definitions | Eliminates false "done" reports | "Task complete when ALL exit 0: lint, test, typecheck" |
| Procedural workflows (numbered steps) | +25% correctness, +20% completeness | 6-step deploy workflow |
| Decision tables | +25% best_practices | "Server-only data? → React Query. Multi-path mutations? → Zustand" |
| Real code examples (3–10 lines) | Improves pattern adherence | Snippet from production code |
| "Don't" paired with "Do" | Prevents overexploration | "Don't instantiate HTTP clients → Use shared apiClient from lib/http" |
| Task-organized sections | Agent selects relevant subset | "When Writing Code / When Reviewing / When Releasing" |
| Escalation rules | Prevents destructive workarounds | "If tests fail after 3 attempts: stop and report" |
| Progressive disclosure | Controls context budget | Main file concise, reference files for details |
| Trigger-first pointers | Referenced docs actually get opened | "Before touching db/, read docs/migrations.md" |
| Exhaustive closure scope | Forces the digging, not just the check | "Every changed model has a migration and a test" |

---

## Three-Tier Boundary System (ASDLC)

```text
NEVER (Hard judgment limits):
- Never commit secrets, tokens, or .env files
- Never add external dependencies without discussion

ASK (Human-in-the-loop triggers):
- Ask before running database migrations
- Ask before deleting files

ALWAYS (Proactive judgment):
- Explain plan before writing code
- Handle all errors explicitly
```

---

## Optimal Structure (Priority Order)

Add sections in this order. Each layer builds on the previous:

1. **Build and test commands** — agent needs these before anything useful
2. **Definition of done** — prevents false completions
3. **Escalation rules** — prevents destructive workarounds
4. **Task-organized sections** — reduces irrelevant parsing
5. **Directory scoping** (monorepos only) — isolates service instructions

Skip style preferences until the first four work.

---

## Cross-Tool Compatibility

| Tool | Native File | Reads AGENTS.md? |
|------|-------------|-----------------|
| Codex CLI | AGENTS.md | Yes (native, full hierarchy + override) |
| Cursor | `.cursor/rules` | Yes (auto-discovered) |
| GitHub Copilot | `.github/copilot-instructions.md` | Yes (native) |
| Amp | AGENTS.md | Yes (co-creator of standard) |
| Windsurf | `.windsurfrules` | Yes (auto-discovered) |
| Gemini CLI | `GEMINI.md` | Configurable |
| Claude Code | CLAUDE.md | No (symlink recommended) |
| Aider | `CONVENTIONS.md` | Manual (`--read AGENTS.md`) |

---

## Monorepo Strategy

- Root-level: broad baseline (stack, global conventions, CI)
- Module/service-level: specific commands, testing patterns, domain context
- Closest AGENTS.md wins — deeper files take precedence
- OpenAI's Codex repo uses 88 separate AGENTS.md files
- Codex supports `AGENTS.override.md` to replace (not extend) parent instructions

---

## Auditing Checklist

Periodically remove:

- Style rules that a linter now enforces
- Library restrictions that tsconfig/ESLint enforces
- Persona definitions moved to skill files
- Codebase overviews copied from README
- LLM-generated sections from `/init` commands (treat as draft)
- Instructions where the underlying friction has been fixed (deleted legacy code, added linter rule)
- Sentences that fail the no-op test (the agent already does this by default)
- Pointers whose target no longer exists, or whose wording carries no trigger
- Branch-only detail (release, migration, one package) that has crept into the always-loaded root file

---

## The Acid Test

> Ask the agent to explain your build commands. If it can't reproduce them verbatim, the instructions aren't being read or are too verbose to retain in context.

A second test for pointers: ask the agent what it would read before a release (or a migration, or whatever the pointer guards). If it can't name the file, the pointer's wording isn't firing.
