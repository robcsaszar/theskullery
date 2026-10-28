---
name: ai-forge-update
description: "Updates an existing SKILL.md or agent definition — structured recap, drift detection, change elicitation with conflict checking, per-item application with approval, and post-change quality gate. Use when an existing skill or agent needs revision, modification, or improvement. Don't use for creating new artifacts — use ai-forge-create for that. Triggers are update/modify/revise/change this skill, edit SKILL.md, improve a skill, update this agent."
---

# AI Forge Update

Understand before touching. Confirm before applying. Judge what you've done.

---

## Phase 0 — Load & Recap

**Skip condition**: If an `ai-forge-recap` result for the same artifact is already in the conversation context, verify the name matches, skip Phase 0 entirely, and proceed to Phase 1 using that recap.

**MANDATORY — Before reading the artifact, load platform constraints:**

- **For agents:** identify the target platform from the file path and extension using the table in [`ai-forge-create/references/agents-taxonomy.md`](../ai-forge-create/references/agents-taxonomy.md), then read that platform's section for frontmatter schema, file naming, line limits, and key constraints. Supported platforms: Claude Code (`.claude/agents/*.md`), GitHub Copilot (`.github/agents/*.agent.md`), OpenAI Codex (`.codex/agents/*.toml`), Google Gemini (`.gemini/agents/*.md` or `.gemini/skills/*/SKILL.md`).
- **For skills:** reference the bundled spec at `ai-forge-judge/references/agentskills-spec.md` for frontmatter validation.

> **Porting to another platform?** That's a conversion, not an update — it produces a **new** target-platform file and never writes back to the source path. Run the disposition report first:
>
> ```sh
> node ../ai-forge-create/scripts/validate-metadata.cjs --name "<n>" --description "<d>" \
>   --target codex --artifact agent
> ```
>
> Apply the PORTABLE and DROPPED rows mechanically. Feed the **DECIDE** rows — model IDs, tool names, effort enums, anything with no bijective mapping — to `ai-forge-apply` as a numbered list so each is an explicit human choice. Never guess one silently; a wrong tool name fails loudly, but a wrong model ID just quietly costs more or reasons worse. Field-level detail is in [`ai-forge-create/references/conversion-guide.md`](../ai-forge-create/references/conversion-guide.md); write the DROPPED and DECIDE rows to `MIGRATION-NOTES.md` beside the ported file.

Identify the target artifact. The user may name it, paste a path, or point to it in context.

If no artifact is identified, ask once: "Which skill or agent do you want to update? (name or path)"

If the named file does not exist, stop: "Can't find [name] — check the path and re-invoke."

Read the artifact completely. Produce a structured recap:

```text
## [Name] — Recap

**Does:** [1–2 sentences: core task and when it fires]
**Type:** [Skill / Agent]
**Pattern:** [Tool / Process / Navigation / Mindset / Philosophy] (skills only)
**Workflow:** [numbered phases or key steps, one line each]
**NEVER rules:** [count] covering [topics]
**References:** [list references/ files, or "none"]
```

**Drift check**: compare the frontmatter `description` field against the actual implementation. If they diverge, surface the discrepancy:

```text
Drift detected: [what the description says] vs [what the artifact actually does]
(s)uggest fixes / (i)gnore and continue
```

On `(s)`: produce a corrected description and add it to the Phase 1 change list as item 0. On `(i)`: proceed without changing the description.

Confirm with user: `Does this match your understanding? (y)es / (n)o`

On `(n)`: ask what's incorrect, revise the recap, and re-confirm before proceeding.

---

## Phase 1 — Change Elicitation Loop

**Goal**: A numbered change list that is specific, unambiguous, and consistent with the existing artifact. Do not touch the file until the list is confirmed.

**Read the evidence first.** If `evals/` results, benchmark output, or run transcripts exist for this artifact, read them before asking what to change. Observed friction beats recalled friction — what a user remembers going wrong and what actually went wrong routinely differ, and only one of them is in the transcript.

**MANDATORY — READ [`references/iteration-guide.md`](references/iteration-guide.md)** before eliciting: how to size the change (iterate vs redesign), and how to translate a reported symptom into an actual edit.

If the change is a redesign — wrong phases, wrong scope, over half the body moving — say so and hand off to `ai-forge-create` rather than patching.

### Loop

Elicit changes, paraphrase back with the updated change list and consistency check, then ask:

```text
(c)ontinue / (r)evise
```

On `(r)`: collect more input, update the change list, loop again.
On `(c)`: lock the numbered list and proceed to Phase 2.

After each response, produce:

```text
## Proposed changes

1. [Change — specific enough to apply unambiguously]
2. ...

## Consistency check

[ ] Rule conflict: [conflicting rule text, or "none"]
[ ] Duplicate guidance: [overlapping section, or "none"]
[ ] Principles violation: [issue, or "none"]
[ ] Scope unclear: [vague term that needs scoping, or "none"]
```

### What triggers each consistency flag

**Rule conflict**: New NEVER contradicts an existing NEVER; new step breaks existing flow order.

**Duplicate guidance**: New section covers the same ground as an existing one — flag and ask: "merge or replace?"

**Principles violation**: NEVER missing WHY or INSTEAD. Request for generic advice ("write clean code", "be thorough"). Any rule that restates what Claude does by default.

**Scope unclear**: "Make it shorter" without specifying what to cut; "improve it" without specifying how. Resolve to specific sections or criteria before adding to the list.

Loop does not advance on ambiguity. Every item in the confirmed list must be independently actionable.

**One behavior per iteration.** Changing three things and re-running tells you the aggregate moved, not which change moved it. Re-run the artifact's `evals/` suite after every change and treat a failure as a regression.

---

## Phase 2 — Apply Changes

Invoke `ai-forge-apply` on the confirmed change list from Phase 1. Apply each item the user approves; skip declined items. After apply completes, show a concise diff summary:

```text
## Changes applied

- [file]:[lines] — [one-line description]
```

If any change affects the artifact's structure or pattern type, verify the pattern still matches:

**Skill line limits**: Body ≤ 200 lines (overflow → `references/`).
**Agent line limits**: Body ≤ 300 lines.

---

## Phase 3 — Judge & Apply

Invoke `ai-forge-judge` on the modified artifact. Its report ends with one question — `Step through these with ai-forge-apply? (y)es / (n)o` — and that is the only prompt on that turn; do not ask it again. On `(y)`: invoke `ai-forge-apply` on the findings, then proceed to Phase 4. On `(n)`: treat it as zero findings applied and use the prompt below.

If apply applied zero findings (every item skipped or marked obsolete), surface:

```text
No judge findings applied — (a)ccept current grade / (r)evise scope / (q)uit without saving
```

On `(r)`, return to Phase 1 with the judge report's improvement list pre-loaded as draft.

If apply stalls on an item (same rejection after 3 revisions), surface:

```text
Stuck on [item] — (a)ccept current state / (r)evise scope / (s)kip
```

---

## Phase 4 — Save & Close

Write the updated artifact to the path it was read from.

Print a one-block close-out:

```text
## ai-forge-update — done

**File:** [path] ([N] lines, pattern: [Tool/Process/...])
**Applied:** [count] / [total] proposed changes
**Judge:** [grade] — [N applied / M reviewed-not-applied from Phase 3]
```

---

## NEVER

- **NEVER apply changes before Phase 1 produces a confirmed change list**
  **Instead:** Run the elicitation loop until the user responds `(c)ontinue`.
  **Why:** Applying ambiguous changes produces a result the user didn't want.

- **NEVER skip the four-point consistency check on each proposed change**
  **Instead:** Run all four checks every iteration, even for simple-sounding requests.
  **Why:** "Add a NEVER rule" sounds trivial but frequently introduces rule conflicts.

- **NEVER use ai-forge-apply in Phase 1**
  **Instead:** Phase 1 is elicitation only. Use ai-forge-apply in Phase 2 for application.
  **Why:** Mixing elicitation and application in the same phase confuses which loop the user is in.

- **NEVER skip Phase 3 (ai-forge-judge) after applying changes**
  **Instead:** Always judge the modified artifact before presenting for final approval.
  **Why:** A change that looks correct can silently drop quality below grade.

- **NEVER proceed to Phase 3 if apply applied zero changes**
  **Instead:** Show the final board and offer `(r)evise change list / (q)uit without saving`.
  **Why:** Judging an unchanged file produces the same grade as before.

- **NEVER apply Phase 2 changes outside ai-forge-apply**
  **Instead:** Always hand the confirmed change list to `ai-forge-apply`.
  **Why:** Per-item approval is the user's only veto point before the file is written.
