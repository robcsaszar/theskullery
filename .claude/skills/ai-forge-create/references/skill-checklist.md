# Skill Authoring Checklist

Run before submitting to `ai-forge-judge`. Every item must pass.

---

## 1. Metadata

- [ ] Name is 1–64 chars, lowercase letters/numbers/hyphens only
- [ ] Name matches the parent directory name exactly
- [ ] No reserved prefixes (`claude`, `anthropic`, `copilot`, `codex`, `gemini`)
- [ ] Description is under 1,024 chars
- [ ] Description is a single-line string — no YAML multiline (`|` or `>`)
- [ ] No unescaped colons in description value (rephrase as `—` or parentheses)
- [ ] No XML angle brackets (`<`, `>`) anywhere in frontmatter
- [ ] Description answers WHAT (capability) and WHEN (trigger scenarios)
- [ ] Description contains searchable keywords (domain terms, action verbs)
- [ ] Description is written in third-person imperative (`Creates…`, `Analyzes…` — not `I can…`, `Helps you…`)
- [ ] Description includes negative triggers (`Don't use for…`)
- [ ] Description reaches for coverage, not just precision — under-triggering is the common failure
- [ ] Description states trigger conditions, not a workflow summary
- [ ] `description` + `when_to_use` combined is under 1,536 chars
- [ ] No dated model ID (`claude-*-20250101`) anywhere in frontmatter
- [ ] Run `node scripts/validate-metadata.cjs` — must exit 0

## 2. File Structure

- [ ] Only `SKILL.md` at skill root — no stray `.md` or data files
- [ ] Documentation files → `references/`
- [ ] Executable scripts (.js, .mjs, .cjs, .sh) → `scripts/`
- [ ] Templates, schemas, static data → `assets/`
- [ ] No `README.md`, `CHANGELOG.md`, or human-centric docs
- [ ] All file paths use forward slashes (`/`), even on Windows
- [ ] All references are exactly 1 level deep from `SKILL.md` (no chained refs)

## 3. Logic (SKILL.md body)

- [ ] Body is under 200 lines and ~1,800 words (`wc -l`, `wc -w`)
- [ ] Baseline probe run before drafting, failures captured verbatim
- [ ] Guidance form matches the observed failure type (see `baseline-probe.md`)
- [ ] Instructions use direct commands (`Extract`, `Run`, `Validate` — not `you should`, `please`)
- [ ] Every phase or step ends on a checkable completion criterion
- [ ] Every prohibition earns its form — explained reasoning was tried first
- [ ] Every NEVER rule has all three parts: the rule, `**Instead:**`, `**Why:**`
- [ ] No `<details>` blocks anywhere
- [ ] No section restates Claude defaults (`write clean code`, `handle errors`, `be helpful`)
- [ ] Each sentence passes the knowledge delta test: "Does Claude already know this?"
- [ ] Reference files > 300 lines have a table of contents at the top
- [ ] MANDATORY READ triggers placed at the exact step that needs the file — not at the top

## 4. Scripts

- [ ] Scripts emit descriptive `stdout` on success and `stderr` on failure
- [ ] Scripts handle error conditions — never return "I don't know" to Claude
- [ ] No voodoo constants — every value is self-documenting
- [ ] Forward slashes in all paths inside scripts

## 5. Quality

- [ ] At least 3 eval cases persisted to `evals/evals.json` — **when the output is objectively verifiable**. Skills with subjective output (writing voice, visual design) are better judged qualitatively; forcing assertions onto them produces pass/fail with no ground truth
- [ ] Tested with at least one model other than the one used to write it
- [ ] No time-sensitive information (versions, dates, URLs that rot)
- [ ] Consistent terminology throughout — one term per concept, no synonyms
