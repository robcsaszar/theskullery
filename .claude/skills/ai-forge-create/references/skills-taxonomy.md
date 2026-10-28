# Skills Taxonomy

Reference for skills-specific drafting rules. Loaded in Phase 3 when artifact type is **Skill**.

## Contents

- [Directory structure](#directory-structure)
- [Progressive disclosure](#progressive-disclosure)
- [Scripts](#scripts)
- [Skill frontmatter fields](#skill-frontmatter-fields)
- [Hooks](#hooks)
- [Principle of lack of surprise](#principle-of-lack-of-surprise)

---

## Directory structure

Place files in the correct spec directory — never at the skill root:

| Content type | Directory |
|---|---|
| Documentation loaded on demand | `references/` |
| Executable scripts (.js, .mjs, .cjs, .sh) | `scripts/` |
| Static data files, templates, JSON schemas | `assets/` |
| Eval suites and their fixtures | `evals/` |
| Benchmark trend baselines (committed) | `benchmarks/` |

Placing executable code or data files at the skill root is a spec violation. The skill root contains only `SKILL.md`.

**Domain-variant organization** — when a skill spans several backends, frameworks, or clouds, give each its own reference and let the body select between them:

```text
cloud-deploy/
├── SKILL.md          workflow + selection logic
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

Only the matching file loads. This beats one combined reference with conditional sections, which loads every variant to use one.

---

## Progressive disclosure

- Body > 200 lines → move heavy content to `references/`
- Any section with a decision tree of 4+ branches → extract to `references/`
- Add MANDATORY READ triggers at the exact workflow step that needs it
- Add "Do NOT load" guidance for files irrelevant to the current scenario
- Context pointer wording controls reliability — "MANDATORY READ before every X call" fires more reliably than "read if needed"; fix the wording before pulling content back inline
- References max 1 level deep from `SKILL.md` — `SKILL.md → ref.md` is fine; `ref.md → deeper.md` causes partial reads where Claude misses content
- Reference files > 300 lines need a table of contents at the top — Claude may preview without reading fully
- `<details>` blocks are not progressive disclosure. Collapsing is a rendering affordance for humans; an agent receives the full expanded text and pays full token cost. Use `references/`.

---

## Scripts

### Script or prose?

The strongest signal is empirical: **if every baseline or eval run independently wrote a similar helper, the skill should ship it.** Three subagents each writing their own `build_chart.py` means the skill is making every invocation reinvent the same wheel — write it once, put it in `scripts/`, and point at it.

Without run data yet, write a script only when the operation needs one of:

- Deterministic repeatability — the same input must produce byte-identical output
- State that outlives a single session
- Self-verification — the step can check its own result
- Calculation the model would plausibly get wrong (statistics, hashing, date math)
- Integration with an external tool or API

If none apply, prose is correct. A script that only restates what the model would do anyway adds a dependency, a failure mode, and a file to maintain.

### Writing them

- **Solve don't punt** — scripts must handle error conditions and emit specific `stderr`; never surface "I don't know" to Claude
- **Forward slashes always** — `scripts/helper.cjs` not `scripts\helper.cjs`, even on Windows
- **Self-documenting constants** — no voodoo values; every constant must be obvious from context
- **stdout/stderr contract** — success to stdout, failure to stderr; Claude reads stderr to self-correct and retry
- **Document them in `SKILL.md`** — including what each exit code means. An undocumented script gets invoked wrong or not at all

---

## Skill frontmatter fields

`name` and `description` are the only fields most skills need. Everything else is opt-in — add a field because the skill needs it, not to look complete.

**Portable (Agent Skills spec — survives to other runtimes):**

| Field | Purpose |
|---|---|
| `name` | Kebab-case, ≤64 chars, matches the directory name |
| `description` | ≤1,024 chars. The only text always in context — see Phase 3 |
| `license` | e.g. `MIT`, `Apache-2.0` |
| `compatibility` | Environment/MCP requirements. Include whenever the skill needs a specific MCP server or system package |
| `metadata` | Author, version, mcp-server |
| `allowed-tools` | Tools usable without a permission prompt while the skill is active |

**Claude Code-only (stripped on conversion — see [`conversion-guide.md`](conversion-guide.md)):**

| Field | Purpose |
|---|---|
| `when_to_use` | Extra routing text appended to `description` in the listing. **Combined cap is 1,536 chars** — past that it is silently truncated |
| `argument-hint` | Autocomplete hint, e.g. `[issue-number]` |
| `arguments` | Named positional arguments for `$name` substitution |
| `disable-model-invocation` | `true` = Claude cannot auto-load it; user must invoke with `/name` |
| `user-invocable` | `false` = hidden from the `/` menu; Claude can still load it |
| `disallowed-tools` | Tools removed from the pool while the skill is active |
| `model` | Model while active. Family aliases only — never a dated ID |
| `effort` | Reasoning effort while active (`low`…`max`) |
| `context` | `fork` runs the skill in a subagent context |
| `agent` | Which subagent type, when `context: fork` |
| `background` | With `context: fork`, `false` waits for the result in-turn |
| `hooks` | Lifecycle hooks scoped to this skill — see below |
| `paths` | Glob patterns limiting when the skill auto-activates |
| `shell` | `bash` (default) or `powershell` for inline shell blocks |

`disable-model-invocation` and `user-invocable` are **orthogonal**, not two spellings of one idea: the first controls whether Claude may load the skill (and keeps the description out of context entirely), the second controls whether the user sees it in the `/` menu.

---

## Hooks

Skill-scoped hooks run only while the skill is active and are cleaned up when it deactivates. Session-wide hooks belong in settings, not here. Five things that are easy to get wrong:

- **Input arrives as JSON on stdin**, not as environment variables. Never interpolate payload text into a shell command string — read it from stdin. Interpolating tool input into a command is a shell-injection hole with an attacker-controlled payload.
- **`matcher` filters on tool name** (`Bash`, `Edit|Write`, `mcp__memory__.*`). The separate **`if`** field is what takes permission-rule syntax (`Bash(git *)`, `Edit(*.ts)`). Putting permission syntax in `matcher` silently never matches.
- **`once: true` is honored only in skill frontmatter** — ignored in settings files and agent frontmatter.
- **Exit codes are not conventional.** `0` = success (stdout parsed for JSON). `2` = block, with stderr fed back to Claude. **Every other code, including `1`, does not block** — execution continues despite `1` being the usual Unix failure code. A hook meant to stop a tool call must exit exactly `2`.
- Hooks that only advise should exit `0` so a failure never interrupts the session.

---

## Principle of lack of surprise

A skill's contents must not surprise someone who has only read its description. A user installing `csv-formatter` has consented to CSV formatting, not to network calls, credential reads, or writes outside the working tree.

Skills must not contain malware, exploit code, or anything that compromises system security. If a skill needs a capability its description doesn't imply — network access, credentials, destructive file operations — say so in the description and in `compatibility`. Roleplay and persona skills are fine; the bar is honesty about capability, not tone.
