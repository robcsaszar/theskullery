---
name: ai-forge-recap
description: "Report what a skill or agent actually does versus what its description claims — drift, undeclared behaviors, verdict. Use before updating a skill or agent, or when a description is suspected of being out of date. Triggers are recap [skill], what does [skill] do, audit [skill] description, summarize [skill]. Don't use for rewriting the artifact — that's ai-forge-update."
---

# AI Forge Recap

Audit a skill or agent by reading its actual implementation and reporting what it *really* does — independent of what the description claims. The description is a claim; the body is the ground truth.

---

## What to Read

Use the path provided or resolved by the environment. If not found, report "Not found" and stop.

For skills: also read any `references/` files marked **MANDATORY READ** — behaviors that live outside the main body still count.

If a `references/` directory exists but no files are marked MANDATORY READ, include this note in **Undeclared behaviors**: "references/ directory present but no MANDATORY READ triggers — possible Orphan References pattern."

For agents: read the full `.agent.md` file including frontmatter (model, tools, etc.).

For other file types (`.instructions.md`, `CLAUDE.md`, standalone prompts): read the full file; if the file has a leading comment or description block, treat it as the "description claim" to compare against the body.

---

## What to Compare

The description makes four implicit claims. Check each against the body:

1. **WHAT it does** — does the body do this, or something adjacent?
2. **WHEN to use it** — do trigger phrases match actual entry conditions?
3. **Keywords** — do searchable terms reflect what the body covers?
4. **Scope** — does the description under- or over-state coverage?

Also scan for **undeclared behaviors**: things the body does that the description never mentions. Focus on locations where iterative edits silently accumulate new behavior: NEVER rules, phases/steps, skip/exit conditions, reference-loading triggers, confirmation loops, conditional output sections, and tool/skill invocations.

**Short targets** (<15 lines body): Focus on scope accuracy over exhaustive four-claim comparison. A minimal body with a matching description is Aligned — don't manufacture drift from brevity.

**Before writing your verdict, ask:** *Would an agent picking from descriptions alone make the right call?* If the description would misroute, that's Significant drift regardless of how small the wording gap appears.

---

## Output Format

```text
## Recap: <name>

**Description claims:** [one-line summary of what description promises]

**Body actually does:** [one-line summary derived independently from reading the body]

**Drift found:**
- [specific discrepancy]
(or "None found")

**Undeclared behaviors:**
- [behavior in body not mentioned in description]
(or "None found")

**Verdict:** Aligned / Minor drift / Significant drift
```

---

## Post-Recap Actions

After writing the recap block, classify the findings into two buckets:

- **Frontmatter drift**: discrepancies in the `name` or `description` fields
- **Body drift**: behavioral discrepancies or undeclared behaviors

If neither bucket has findings, output "No drift found." and stop — do not show the action menu.

Otherwise, show only the options relevant to what was found:

```text
(f)ix frontmatter — apply corrected name/description fields via ai-forge-apply  [only if frontmatter drift]
(u)pdate body     — hand off to ai-forge-update with drift loaded               [only if body drift]
(j)udge           — run ai-forge-judge for quality scoring                       [always]
(r)eview          — run ai-forge-review for interactive design check             [agents only]
```

### (f) Fix frontmatter

Produce a numbered findings list covering only the drifted fields. Each item must include the current value and the corrected value:

```text
1. name: "<current>" → "<corrected>"
2. description: "<current>" → "<corrected>"
```

Then invoke `ai-forge-apply` on that list.

### (u) Update body

Invoke `ai-forge-update` and pass the recap output as pre-loaded context. State explicitly that Phase 0 is already complete so ai-forge-update skips directly to Phase 1 change elicitation.

### (j) Judge

Invoke `ai-forge-judge` on the recapped artifact.

### (r) Review

Invoke `ai-forge-review` on the recapped agent. Only available for agent definitions.

---

## Verdict Criteria

**Minor drift**: Description is imprecise but not misleading. The artifact would still be selected for the right task.

**Significant drift**: Description would cause the artifact to be selected for the wrong task, OR the agent would miss a key behavior because the description omits it.

An *incomplete* description (missing behaviors) differs from a *wrong* description (claiming behaviors that don't exist). Flag both, label them separately.

---

## NEVER

- **NEVER start your "body actually does" summary by paraphrasing the description**
  **Instead:** Read the body first, form an independent summary, then compare to the description.
  **Why:** Starting from the description anchors you to its framing — you'll miss drift because your summary will match it by construction.

- **NEVER skip MANDATORY READ reference files**
  **Instead:** Load them before forming your assessment.
  **Why:** Key behaviors — NEVER rules, decision trees, phase logic — often live in references, not the main body.

- **NEVER mark a description as "wrong" when it's merely "incomplete"**
  **Instead:** Label each discrepancy explicitly: *incomplete* vs. *wrong*.
  **Why:** The remediation differs — incomplete descriptions need additions; wrong descriptions need corrections.

- **NEVER report drift on formatting or style differences alone**
  **Instead:** Focus on semantic mismatches — does the description promise different *behavior* than the body delivers?
  **Why:** A description that says "audit" while the body says "evaluate" is stylistic, not drift. Reporting it floods the output with noise.

- **NEVER flag behaviors inherited from the pattern or calling convention as "undeclared"**
  **Instead:** Only flag behaviors the body *adds* beyond what any skill/agent of this pattern would do.
  **Why:** Every Tool-pattern skill has a NEVER list and output format — these aren't undeclared, they're structural.

- **NEVER conflate description brevity with scope understatement**
  **Instead:** A short description that accurately covers the core purpose is Aligned, even if the body is long.
  **Why:** Descriptions are capped at 1024 chars; they summarize, not exhaustively list. Judge routing accuracy, not word count parity.
