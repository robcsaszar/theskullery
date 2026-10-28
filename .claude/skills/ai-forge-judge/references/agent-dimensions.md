# Agent / System Prompt Evaluation Dimensions (C1–C3)

Detailed scoring rubrics for dimensions that apply when evaluating agent definitions (.agent.md) or system prompts — any prompt that governs LLM behavioral settings rather than teaching domain skills.

---

## C1: Behavioral Clarity (15 points)

Are instructions unambiguous, internally consistent, and non-contradictory?

The core failure mode for agent-style prompts is not redundancy (as in Skills) but **ambiguity** — when the model encounters a situation that two instructions govern differently, it picks one arbitrarily. The author never finds out.

| Score | Criteria |
|-------|----------|
| 0–5 | Contradictory instructions, or so vague the model must guess intent |
| 6–10 | Mostly clear but some instructions conflict or use inconsistent language |
| 11–13 | Clear throughout, minor ambiguity in edge cases |
| 14–15 | Unambiguous, consistent vocabulary, zero contradictions |

**What to check**:

- [ ] Do any two instructions govern the same scenario with different outcomes?
- [ ] Is MUST/NEVER/SHOULD/MAY used consistently with the same meaning throughout?
- [ ] Are conditional instructions ("if X, then Y") complete — do they cover the else case when it matters?
- [ ] Are imperative and descriptive voice mixed in a way that's confusing?
- [ ] Do sections added at different times now conflict with each other?

**Example of ambiguity failure**:

```text
Section A: "Always ask for clarification before proceeding."
Section B: "Prefer action over asking — users find questions annoying."
```

**Example of clarity**:

```text
"When the task is ambiguous AND the consequence of guessing wrong is high
(destructive operations, external sends), ask for clarification.
For low-consequence ambiguity, make a reasonable assumption and proceed."
```

---

## C2: Scope Definition (15 points)

Does the prompt govern only what actually needs governing — and avoid over-specifying what the model handles well by default?

**The scope failure modes**:

1. **Over-scoped**: So many rules it becomes noise; real constraints get buried
2. **Under-scoped**: Leaves out genuine edge cases that cause repeated failures
3. **Wrong domain**: Governs something the model already does well, wasting tokens

| Score | Criteria |
|-------|----------|
| 0–5 | Severely over- or under-scoped; rules for things the model already handles |
| 6–10 | Mostly appropriate scope with some waste or gaps |
| 11–13 | Well-scoped with minor issues |
| 14–15 | Governs exactly what needs governing; no redundant defaults |

**What to check**:

- [ ] Does it tell the model to do things it already does by default? (token waste)
- [ ] Are the rules clearly applicable to a specific context, or trying to govern everything?
- [ ] Is there a gap — a known failure mode in this domain that isn't covered?
- [ ] Do rules have enough context to know WHEN they apply vs. when they don't?
- [ ] Does the persona line name the role's methods, tools, and raw material, or only a title? A title alone ("You are a security expert") is a costume — the model changes vocabulary, not method. Deduct.

**Red flags** (over-scoping):

- "Be helpful and professional" — the model does this by default
- "Write clear, readable code" — model does this by default
- Rules for every conceivable edge case, including ones that never occur

**Red flags** (under-scoping):

- Known recurring failure modes not mentioned
- Vague scope ("sometimes", "usually") where specificity matters

---

## C3: Structural Organization (10 points)

Can an LLM efficiently locate and apply the relevant rules during inference?

| Score | Criteria |
|-------|----------|
| 0–3 | Prose walls, no sectioning, instructions buried mid-paragraph |
| 4–6 | Some structure but inconsistent; important rules mixed with minor ones |
| 7–8 | Clear sections, logical grouping, priority roughly communicated |
| 9–10 | Optimal: most critical rules prominent, consistent format throughout |

**What to check**:

- [ ] Are related instructions grouped together or scattered?
- [ ] Are the most important rules prominent (early, in dedicated sections, or marked)?
- [ ] Is the format consistent — headers, lists, or prose, not all three mixed arbitrarily?
- [ ] Is there duplication across sections?
- [ ] Would a new reader understand the priority ordering of rules?

**Good structural patterns**:

```markdown
## Critical (always applies)
- Rule with consequence

## Contextual (when X)
- Rule that applies in specific situations

## Preferences (when ambiguous)
- Default behavior when no other rule applies
```

**Agent-specific structural checks**:

- [ ] Is the frontmatter correct? (name, description, model, tools)
- [ ] Are tool restrictions justified by the agent's stated purpose?
- [ ] Is the model choice appropriate for task complexity?
- [ ] Does the body flow: persona → workflow → constraints → output format?
