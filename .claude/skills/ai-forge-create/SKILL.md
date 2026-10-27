---
name: ai-forge-create
description: "Create a new skill (SKILL.md), agent definition, or instruction file. Use when converting ad-hoc knowledge into a reusable skill, scaffolding an agent for Claude Code, GitHub Copilot, OpenAI Codex, or Google Gemini, or creating instruction files for glob-pattern matching. Don't use for updating existing artifacts — use ai-forge-update for that. Triggers are create a skill, write a skill, new skill, SKILL.md, build a skill, create an agent, new agent, scaffold an agent."
---

# AI Forge Create

Write skills and agents that score ≥B on ai-forge-judge out of the box. Every section must earn its tokens.

---

## Phase 0 — Dedup

Before anything else, check whether this already exists. Glob the platform roots listed in [`ai-forge-audit`](../ai-forge-audit/SKILL.md) Phase 1 and compare names and descriptions against the request.

- **Strong match** (same domain and overlapping triggers) — surface it and stop: "`<name>` already covers this. Options — (u)pdate it via ai-forge-update, (c)reate anyway with a narrower scope, or (q)uit." An explicit "create a skill" request plus a strong match is a reason to challenge, not to comply.
- **Partial match** — name it, then continue; the new artifact must state how it differs in its own description.
- **No match** — continue silently.

---

## Phase 1 — Discovery

Build understanding through a running recap. Ask questions to fill gaps; after each exchange, show the current recap:

```text
## Discovery Recap

**Domain:** [what the skill/agent covers, or "unknown"]
**Artifact type:** [Skill / Agent / Instruction file]
**Platform:** [Claude Code / GitHub Copilot / OpenAI Codex / Google Gemini — infer from file path: .claude/ → Claude Code, .github/ → Copilot, .codex/ → Codex, .gemini/ → Gemini]
**Decisions:** [non-obvious choices the agent must make, or "unknown"]
**Failure modes:** [what breaks without this artifact, or "unknown"]
**Audience:** [fragile/creative output, or "inferred: ..."]
**Size:** [reference files needed, or "inferred: self-contained"]
```

Then ask: `(a)ccept / (r)evise / (q)uit`

- `a` — recap is complete; proceed to Phase 2
- `r` — user adds or corrects; update recap and loop
- `q` — abort

Do not proceed to Phase 2 until the user accepts the recap. Domain, artifact type, and failure modes must be filled before accepting. **Platform must also be resolved** — it drives frontmatter schema, file location, and invocation constraints for both agents and skills.

> **Porting an existing artifact to another platform?** That's a *conversion*, not authoring — hand off to `ai-forge-update`, which runs the target disposition report and steps the judgment calls through approval. The per-field mappings live in [`references/conversion-guide.md`](references/conversion-guide.md).

---

## Phase 1b — Baseline Probe

**MANDATORY — READ [`references/baseline-probe.md`](references/baseline-probe.md)** before drafting.

Spawn 1–2 fresh subagents on representative tasks **without** the artifact and record verbatim what they get wrong. Phase 1 collects failure modes the author asserts; this collects the ones that occur.

If the baseline succeeds, say so and offer to stop — a clean baseline means the artifact may not need to exist. The capture feeds three places: description keywords, guidance form, and eval assertions. Skip only when the user declines after being told what the skip costs.

---

## Phase 2 — Pattern Selection

**For Skills**: MANDATORY — READ [`references/skill-patterns.md`](references/skill-patterns.md) before selecting a pattern. Do NOT load this file for agents.

**For Agents**: MANDATORY — READ [`references/agent-patterns.md`](references/agent-patterns.md) before selecting a pattern. Do NOT load this file for skills.

Select one pattern. State your choice and the one-line reason before drafting. If no pattern clearly fits, default to Process and note: "Pattern: Process (closest fit — no exact match for this domain)."

Let the Phase 1b failure type inform the choice — the failure-form table in [`references/baseline-probe.md`](references/baseline-probe.md) constrains which guidance shapes will work.

---

## Phase 3 — Draft

Write the description before the body. Draft the body around what the description promises.

Write to earn tokens. For every **sentence**, ask: **"Does Claude already know this?"**

- If yes → delete it
- If "it's a useful reminder" → one line max, then move on
- If no → expand it; this is the value

Before writing each line, ask: **"What failure mode does this prevent?"** If you can't answer, delete it.

**MANDATORY — READ [`references/drafting-craft.md`](references/drafting-craft.md)** for leading words, degrees of freedom, completion criteria, and the NEVER rule format.

### Description requirements (THE most critical field)

- Answers WHAT (what does it do?)
- Answers WHEN (trigger scenarios — "Use when...", "Trigger phrases:")
- Contains searchable KEYWORDS (domain terms, file extensions, action verbs) — prefer the words the Phase 1b baseline agent used, since those are what a real user types
- Max 1024 chars (hard limit); concise and actionable for agents
- **Counteract under-triggering** — the common failure is a skill that never fires, not one that fires too often. Be slightly pushy: "Use whenever the user mentions X, even if they don't ask for Y by name." Pair it with a negative trigger so the extra reach stays bounded
- **Describe triggers, not the workflow** — a description that narrates the steps gets acted on directly and the agent skips the body. State the conditions under which to load it; the body states what to do
- **`when_to_use` is optional overflow, not a second description** — Claude Code truncates `description` + `when_to_use` combined at **1,536 chars** in the skill listing, so anything past that is silently cut. Keep the load-bearing triggers in `description`
- **Single-line value** — NEVER use YAML multiline (`|` or `>`)
- **No colons** — rephrase "X: Y" as "X — Y" or "X (Y)"; unescaped colons break frontmatter
- **No XML angle brackets** (`<`, `>`) anywhere in frontmatter — enables prompt injection
- **Third-person imperative only** — "Creates…", "Analyzes…", not "I can…", "You can…", or "Helps with…"; first/second-person breaks discovery
- **Negative triggers** — include "Don't use for [anti-scenario]" to prevent mis-activation on adjacent tasks
- One trigger per distinct scenario — synonyms that rename the same branch are duplication
- Model-invoked vs user-invoked: if `disable-model-invocation: true`, description is human-facing only — strip trigger phrasing, no KEYWORDS needed

### Size limits

| Artifact | Body limit | Overflow strategy |
|----------|-----------|-------------------|
| Skill SKILL.md | 200 lines / ~1,800 words | Split to `references/` with MANDATORY READ triggers |
| Agent .agent.md | 300 lines / ~2,700 words | No overflow — must be self-contained |
| Instruction file | 150 lines | Keep lean — loads eagerly on glob match |

Check with `wc -l` and `wc -w`. Words are what actually load; lines are the eyeball proxy. The two numbers are set to bind at roughly the same point (markdown prose runs 6–9 words per line) — if one limit fired far earlier than the other, the looser one would be decoration.

The 200-line skill budget is a deliberate house rule well under the spec's 500-line ceiling: a pack about token economy holds itself tighter than the limit.

**For Skills** — MANDATORY READ [`references/skills-taxonomy.md`](references/skills-taxonomy.md) for: directory structure, progressive disclosure, scripts guidelines, and skill frontmatter optional fields. Do NOT load this file for agents.

**For Agents** — MANDATORY READ [`references/agents-taxonomy.md`](references/agents-taxonomy.md) for: per-platform file naming, folder structure, frontmatter schema, tool access, model IDs, invocation mechanics, and key constraints. Covers Claude Code, GitHub Copilot, OpenAI Codex, and Google Gemini. Do NOT load this file for skills.

---

## Phase 4 — Self-Evaluate

Invoke `ai-forge-judge` on the draft. Target: ≥B (80%+).

If judge returns zero improvements (grade A, empty list), skip ai-forge-apply and proceed to Phase 5: "Judge returned A with no improvements — proceeding to review offer."

Otherwise, invoke `ai-forge-apply` on the numbered improvements list. Do not apply fixes manually.

If ai-forge-apply stalls on a dimension (same item rejected after 3 revisions), surface it to the user: "Stuck on [dimension] — here's what I tried. Options: accept the current draft, revise the scope, or skip."

---

## Phase 5 — Review Offer

After Phase 4 completes, offer the interactive design review:

> "Want me to stress-test this design? Say 'review this' to run `ai-forge-review`."

This is optional but recommended for agents and complex skills. If the user doesn't respond, proceed to Phase 6.

---

## Phase 6 — Test (optional)

After Phase 5 resolves, offer behavioral validation:

> "Want to verify this works end-to-end? Say 'test this' to run `ai-forge-eval` with 2–3 sample prompts."

`ai-forge-eval` spawns parallel with-artifact vs baseline agents, grades outputs against assertions, and shows a pass_rate delta. It writes the suite to `evals/evals.json` so it can be re-run as a regression test after every future change.

Carry the Phase 1b captures forward — each becomes a scenario's `baseline_failure`, and the assertion is that it no longer occurs.

Recommended for Process and Tool pattern artifacts, and any artifact whose output is objectively verifiable. Optional for Mindset/Navigation/Philosophy, where qualitative review beats assertions.

---

## Review Checklist (before finalizing)

MANDATORY — run `node scripts/validate-metadata.cjs --name "<name>" --description "<desc>"` before Phase 4. Cross-check against [`references/skill-checklist.md`](references/skill-checklist.md). If any item fails, fix before submitting to `ai-forge-judge`. If the script **cannot run** (no `node`, missing script, usage error — both cases exit `1`, so read the error text), walk the checklist by hand and mark the result `⚠ metadata unvalidated`. Start from [`assets/SKILL.template.md`](assets/SKILL.template.md).

---

## NEVER

- **NEVER write a section that restates Claude defaults** ("write clean code", "handle errors", "be helpful")
  **Instead:** Ask: "Would Claude do this without being told?" If yes, delete it.
  **Why:** Default restatements dilute expert signal and train authors that padding is acceptable.

- **NEVER add a NEVER rule without WHY and INSTEAD**
  **Instead:** Complete the three-part format before moving on.
  **Why:** A prohibition without an alternative gets violated when the obvious path is blocked.

- **NEVER dump all content in a single file**
  **Instead:** Keep skill body under 200 lines; move detail to `references/` with MANDATORY READ triggers.
  **Why:** A bloated body loads all at once on every invocation — drowns agent in irrelevant content.

- **NEVER skip Phase 4** (ai-forge-judge self-eval)
  **Instead:** Run it even if the draft feels good.
  **Why:** Skills that skip self-eval consistently have U1 or U3 gaps that aren't obvious to the author.

- **NEVER manually apply ai-forge-judge findings one-by-one**
  **Instead:** Invoke `ai-forge-apply` on the numbered improvements list.
  **Why:** Manual application skips the approval loop and defeats the purpose of the numbered format.

- **NEVER use `<details>` blocks to "save context"**
  **Instead:** Move the content to `references/` with a MANDATORY READ trigger.
  **Why:** Collapsing is a rendering affordance for humans. An agent receives the full expanded text either way, so the block costs exactly as many tokens as the content it hides.

- **NEVER pin a dated model ID** (`claude-*-20250101`) in a shipped artifact
  **Instead:** Use a family alias (`sonnet`, `opus`, `haiku`) or omit the field.
  **Why:** Dated IDs are deprecated on a schedule the artifact doesn't control; the skill breaks on a date nobody wrote down.

- **NEVER add README.md, CHANGELOG.md, or documentation about the artifact itself**
  **Instead:** Include only what the agent needs to perform the task.
  **Why:** Meta-documentation is never loaded during execution — it wastes directory space.

- **NEVER open an agent with a costume and no instruments** ("You are a security expert")
  **Instead:** Name the methods, tools, and raw material the role reaches for, and what other than the agent checks its output.
  **Why:** A title alone switches vocabulary, not method — the agent writes like the expert and works as before.

- **NEVER write a vague description without explicit WHEN triggers and searchable keywords**
  **Instead:** Include "Use when...", specific scenarios, and domain-specific terms.
  **Why:** The description is the only thing the agent sees when deciding which skill to load — poor description = skill never activates.
