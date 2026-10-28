---
name: ai-agents-dot-md
description: "Creates, reviews, and improves AGENTS.md files for repositories. Review mode scores the file, then offers to apply the fixes to it. Use when user wants to generate agent documentation, scaffold AGENTS.md, review or improve an existing AGENTS.md, or make their repo agent-friendly. Don't use for documenting codebase architecture and domain model — that's ai-context-dot-md. Triggers are AGENTS.md, agent docs, review agents file, create agents file, coding agent context, repository setup for AI."
---

# AI Create / Review AGENTS.md

Two modes: **create** a new AGENTS.md or **review** an existing one against research-backed quality standards.

## Mode Detection

- User provides an existing AGENTS.md or points to one → **Review mode**
- User asks to create/scaffold/generate → **Create mode**
- Ambiguous → ask: `(c)reate a new AGENTS.md or (r)eview an existing one?`

---

## Create Mode

### Step 1: Ask placement

```text
Where should the AGENTS.md be placed?
(r)oot — repo-wide baseline
(p)ath — specific directory (provide path)
```

For monorepos: suggest root + per-package files. Closest AGENTS.md wins.

If AGENTS.md already exists at target path → ask: `File exists. (r)eview existing / (o)verwrite / (Q)uit?`

### Step 2: Expert thinking

Before writing, determine for THIS project:

- **What's undiscoverable?** What can't be inferred from package.json, configs, or directory structure?
- **What's dangerous?** What commands or patterns cause silent failures?
- **What's ambiguous?** Where are there two valid approaches and the agent would guess wrong?
- **What's non-standard?** What conventions differ from framework defaults?
- **What's branch-only?** Which instructions apply on every task, and which only on some (releases, migrations, one package)? AGENTS.md is loaded at the start of every session, so each line costs tokens and attention on every task whether or not it applies. Inline what every task needs; push what only some tasks reach into a referenced file behind a pointer. Release steps sitting in a root file are paid for by every bug fix.

If all answers are "nothing" — the project may not need an AGENTS.md. Say so.

For repos without package.json or build configs (docs-only, data repos, simple scripts): focus on Mission + Judgment boundaries only — toolchain and closure sections won't apply.

### Step 3: Write in priority order

Add sections ONLY if they pass the undiscoverable test, in this order:

1. **Mission** (2–4 sentences) — project purpose + core constraint the agent can't infer
2. **Toolchain registry** — commands as table, NOT what tools enforce
3. **Judgment boundaries** — NEVER / ASK / ALWAYS tiers
4. **Closure definition** — "Done" = specific exit codes, plus how much the check demands (`every changed model has a migration and a test`, not `update tests`)
5. **Escalation rules** — what to do when blocked
6. **Task-organized sections** — "When writing… / When reviewing… / When releasing…"

**Pointers.** When a line names another file, write the trigger first and the target second: `Before editing anything under db/, read docs/migrations.md` — not `See docs/migrations.md for database notes`. The wording of the pointer, not the quality of the target, decides whether the agent ever opens it; a must-read doc behind a weak pointer is a reliability bug. Sharpen the wording before resorting to inlining the content. One trigger per situation — two phrasings of the same case are one pointer written twice.

**Leading words.** Pick one short, familiar word for each recurring behaviour (`gate`, `blocked`, `green`, `dry run`) and repeat that exact token wherever the behaviour appears — never re-explain it as a sentence. A repeated word accumulates a shared meaning across the file and anchors more reliably than a fresh phrasing each time. Prefer words the agent already knows over coined terms, which cost definition lines. If a word is too weak to move behaviour (`thorough`), the fix is a stronger word (`exhaustive`), not more sentences.

**Closure demand.** "All exit 0" says how to check; the scope says how hard to look. `Every changed model has a migration and a test` forces exhaustive work where `update tests` lets the agent stop after one. Put the scope in the criterion, as `every X`, rather than as a separate reminder.

### Step 4: Validate

- Total ≤ 150 lines (optimal: 60–100)
- Each section ≤ 50 lines
- Every instruction answers: "What command proves this was done?"
- Every "don't" is paired with a "do"
- No linter rules restated (toolchain first)
- No prose paragraphs without commands
- Every sentence changes behaviour versus what the agent does by default — if it doesn't, delete the whole sentence
- Every pointer to another file carries the condition for opening it
- Each concept's definition, rules, and caveats sit under one heading, not scattered across the file

**MANDATORY — READ [`references/knowledge-base.md`](references/knowledge-base.md)** for research-backed patterns and evidence.
**MANDATORY — READ [`references/template.md`](references/template.md)** for starter structure.
**Load [`references/example.md`](references/example.md)** only when the user asks what a finished AGENTS.md looks like, or when the repo is a JS/TS monorepo (it is a turborepo + pnpm worked example) — skip it otherwise.
**Do NOT load** `references/knowledge-base.md` during Review mode if the target AGENTS.md is < 20 lines — the body checklist and anti-pattern list suffice for trivially short files.

---

## Review Mode

Evaluate the provided AGENTS.md against research-backed quality criteria.

### Scoring Dimensions

| Dimension | Weight | What to check |
|-----------|--------|---------------|
| Signal density | 25% | % of lines that are undiscoverable expert knowledge vs. generic/redundant/no-op |
| Command-first | 20% | Every instruction has a verifiable command or exit code |
| Closure definition | 15% | Explicit "done" criteria with specific checks and a stated demand |
| Boundary system | 15% | NEVER/ASK/ALWAYS tiers present and specific |
| Length discipline | 10% | ≤150 total, ≤50 per section, no bloat, no sediment |
| Anti-pattern absence | 15% | Free of proven-to-fail patterns |

### Scoring Guidance

- Score **harshly on signal density** for mature repos with established toolchains — most content is likely redundant
- Score **leniently on closure/boundaries** for greenfield projects — they may not have CI gates yet
- Score **harshly on length** for monorepo root files — these get loaded on every session across all packages
- If total score < 40: recommend rewrite rather than incremental fixes

### Anti-Pattern Checklist

Flag any of these (empirically proven to hurt agent performance):

- [ ] Prose paragraphs without commands
- [ ] Ambiguous directives ("be careful", "where possible")
- [ ] Contradictory priorities without explicit ordering
- [ ] Style rules already enforced by linter config
- [ ] Architecture overviews (causes overexploration)
- [ ] 15+ warnings without paired alternatives
- [ ] LLM-generated boilerplate from `/init` commands
- [ ] Restating what the toolchain enforces
- [ ] Pink elephant violations (long "do not" lists keeping banned concepts active)
- [ ] No-op instructions the agent already follows by default ("write clean code", "be thorough")
- [ ] Bare pointers — a file named without the condition for opening it
- [ ] Scattered concepts — one rule's definition, exceptions, and caveats under different headings
- [ ] Sediment — lines about friction that has since been fixed, tools no longer used, layouts that moved
- [ ] Branch-only detail inlined — release, migration, or single-package steps loaded on every session

### Output Format

```text
## AGENTS.md Review: <filename or path>

**Score**: X/100
**Verdict**: [Production-ready / Needs work / Rewrite recommended]

### Strengths
- ...

### Issues (by severity)
1. [CRITICAL] ...
2. [HIGH] ...
3. [LOW] ...

### Rewrite Suggestions
1. ...
2. ...
```

### Apply

The review is not the deliverable — a better AGENTS.md is. After presenting it, offer:

`Apply? (a)ll / (s)elect by number / (n)one`

On `(a)` or `(s)`: edit the file in place, one numbered item at a time, then re-run the scoring dimensions and report the new score alongside the old one. Every line the review did not flag survives verbatim — a review is not a rewrite mandate, and silently "improving" unflagged prose is how a review pass destroys the author's voice and intent.

Skip the offer when the user supplied the content inline rather than a path, or the file is not writable. Say so rather than reporting improvements as applied.

**MANDATORY — READ [`references/knowledge-base.md`](references/knowledge-base.md)** for the research evidence behind each criterion.

---

## NEVER

- **NEVER include content the agent can discover from repo structure** — package.json scripts, directory layout, and config files are self-documenting; restating them wastes tokens and creates maintenance drift. **INSTEAD:** reference the file (`see biome.json`) and move on.
- **NEVER restate linter/formatter rules** — the tool IS the constraint; duplication creates staleness and unnecessary requirements actively harm agent performance. **INSTEAD:** list only the run command (`Lint: \`pnpm lint\``).
- **NEVER write a "don't" without a paired "do"** — warning-only docs cause overexploration; 15+ don'ts without alternatives makes agents conservative and less productive. **INSTEAD:** pair every prohibition with the correct alternative.
- **NEVER exceed 150 lines** — beyond this threshold, gains reverse and the file actively hurts quality. **INSTEAD:** extract detail into referenced files or delete.
- **NEVER use LLM-generated content as final** — `/init` output is an inventory of what the agent already knows; it reduces performance and inflates cost. **INSTEAD:** treat as draft inventory, then strip everything the toolchain already enforces.
- **NEVER write prose paragraphs** — agents skip them; use commands, tables, and bullets with verifiable outcomes. **INSTEAD:** convert to command + exit code + one-line description.
- **NEVER name a reference file without its trigger** — `See docs/deploy.md` is a line the agent reads and never acts on. **INSTEAD:** lead with the condition: `Before any release step, read docs/deploy.md`.
- **NEVER keep a sentence that only restates the default** — it spends attention to change nothing. **INSTEAD:** delete the sentence, or replace the weak word with one strong enough to move behaviour (`exhaustive`, not `thorough`).
