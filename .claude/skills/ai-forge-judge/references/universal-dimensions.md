# Universal Evaluation Dimensions (U1–U5)

Detailed scoring rubrics for dimensions that apply to every LLM-consumed prompt, regardless of type.

---

## U1: Knowledge/Instruction Delta (20 points) — THE CORE DIMENSION

The most important dimension. Does the prompt add genuine expert knowledge or non-obvious instructions?

| Score | Criteria |
|-------|----------|
| 0–5 | Explains basics Claude knows (what is X, how to write code, standard library tutorials, default behaviors) |
| 6–10 | Mixed: some expert knowledge diluted by obvious content |
| 11–15 | Mostly expert knowledge with minimal redundancy |
| 16–20 | Pure knowledge delta — every paragraph earns its tokens |

**Red flags** (instant score ≤5):

- "What is [basic concept]" sections
- Step-by-step tutorials for standard operations
- Explaining how to use common libraries
- Generic best practices ("write clean code", "handle errors")
- Definitions of industry-standard terms
- Restating what Claude does by default anyway

**Green flags** (high knowledge delta):

- Decision trees for non-obvious choices ("when X fails, try Y because Z")
- Trade-offs only an expert would know ("A is faster but B handles edge case C")
- Edge cases from real-world experience
- "NEVER do X because [non-obvious reason]"
- Domain-specific thinking frameworks
- Constraints specific to a particular environment or toolchain

**Evaluation questions**:

1. For each section, ask: "Does Claude already know this?"
2. If explaining something, ask: "Is this explaining TO Claude or FOR Claude?"
3. Count paragraphs that are Expert vs Activation vs Redundant

---

## U2: Mindset + Appropriate Procedures (15 points)

Does the prompt transfer expert **thinking patterns** along with **necessary domain-specific procedures**?

**Key distinction**:

| Type | Example | Value |
|------|---------|-------|
| **Thinking patterns** | "Before designing, ask: What makes this memorable?" | High — shapes decision-making |
| **Domain-specific procedures** | "OOXML workflow: unpack → edit XML → validate → pack" | High — Claude may not know this |
| **Generic procedures** | "Step 1: Open file, Step 2: Edit, Step 3: Save" | Low — Claude already knows |

| Score | Criteria |
|-------|----------|
| 0–3 | Only generic procedures Claude already knows |
| 4–7 | Has domain procedures but lacks thinking frameworks |
| 8–11 | Good balance: thinking patterns + domain-specific workflows |
| 12–15 | Expert-level: shapes thinking AND provides procedures Claude wouldn't know |

**Expert thinking patterns look like**:

```markdown
Before [action], ask yourself:
- **Purpose**: What problem does this solve? Who uses it?
- **Constraints**: What are the hidden requirements?
- **Differentiation**: What makes this solution correct vs. merely plausible?
```

---

## U3: Constraint Quality (15 points)

Are the prompt's constraints justified, explained, and load-bearing?

**Score the justification, not the format.** A NEVER list is one way to express a constraint, not evidence of quality. A prompt that achieves the same constraint by explaining the reasoning scores *higher* than one that asserts it — a model that understands why a rule exists honours it in cases the rule never anticipated, while a bare prohibition gets violated the moment the obvious path is blocked.

| Score | Criteria |
|-------|----------|
| 0–3 | No constraints where the domain clearly has failure modes, or only generic warnings ("avoid errors", "be careful") |
| 4–7 | Constraints are asserted without reasoning, or prohibit things the model wouldn't do anyway |
| 8–11 | Constraints are specific and mostly carry a WHY; some restate defaults or duplicate each other |
| 12–15 | Every constraint is load-bearing, non-obvious, and explains the failure it prevents — things only experience teaches |

**Strong** (specific, with the mechanism):

```markdown
NEVER chain commands with && — the safety check fires on
ambiguous multi-command calls and interrupts mid-flow.
```

**Weak** (vague, no reasoning):

```markdown
Avoid making mistakes.
Be careful with edge cases.
```

**The test**: would an expert read these and say "yes, I learned this the hard way"? Or "this is obvious to everyone"?

**Do not deduct for the absence of a NEVER list.** Ask instead whether the prompt's domain *has* recurring failure modes and whether they're addressed at all — in any form. A prompt covering a domain with genuine traps and no constraints anywhere is a real U3 gap. A prompt whose constraints are prose because prose fits better is not.

**Do deduct for prohibition bloat**: a wall of NEVERs where explanation would work reads as rigor while delivering less of it, and each low-value prohibition dilutes the ones that matter. Flag any prohibition whose **Why** merely restates the rule — if the reason is self-evident, the rule is redundant with what the model already does.

---

## U4: Freedom Calibration (15 points)

Is the level of specificity appropriate for the task's fragility?

| Score | Criteria |
|-------|----------|
| 0–5 | Severely mismatched (rigid scripts for creative tasks, vague for fragile ops) |
| 6–10 | Partially appropriate, some mismatches |
| 11–13 | Good calibration for most scenarios |
| 14–15 | Perfect freedom calibration throughout |

**The freedom spectrum**:

| Task Type | Should Have | Why |
|-----------|-------------|-----|
| Creative/Design | High freedom | Multiple valid approaches |
| Code review | Medium freedom | Principles exist but judgment required |
| File format operations | Low freedom | One wrong byte corrupts file |
| Shell commands | Low freedom | Wrong command = irreversible state change |

**The test**: Ask "if the agent makes a mistake, what's the consequence?"

- High consequence → Low freedom
- Low consequence → High freedom

**Freedom decreases from thinking to acting.** Within a single prompt, analysis tolerates
latitude, planning less, execution least. A prompt set to one uniform level across all three is
miscalibrated even when that level suits its riskiest step — score it in the 6–10 band. The
signatures are distinct: low freedom everywhere is brittle and breaks on unexpected input; high
freedom everywhere produces inconsistent output with no quality floor.

**Guidance form should match the failure it addresses.** Where the prompt documents a failure
mode, check that the form fits it:

| Failure being addressed | Form that works | Deduct when the prompt uses |
|---|---|---|
| Rule known but skipped under pressure | Prohibition + rationalization table | Soft "prefer"/"consider" phrasing |
| Output structurally wrong despite compliance | Positive recipe of what the output *is* | Prohibition lists alone |
| Required element missing | REQUIRED slot in a template | Prose reminders |
| Behavior should vary by context | Conditional on an observable predicate | Unconditional rule plus exemptions |

Also deduct for nuance clauses that reopen negotiation ("usually X, though sometimes Y may be
appropriate") — they restore exactly the latitude the rule was written to remove.

---

## U5: Practical Usability (15 points)

Can an agent actually use this prompt effectively?

| Score | Criteria |
|-------|----------|
| 0–5 | Confusing, incomplete, contradictory, or untested guidance |
| 6–10 | Usable but with noticeable gaps |
| 11–13 | Clear guidance for common cases |
| 14–15 | Comprehensive coverage including edge cases and error handling |

**Check for**:

- **Decision trees**: For multi-path scenarios, is there clear guidance on which path to take?
- **Actionability**: Can agent immediately act, or does it need to figure things out first?
- **Error handling**: What if the main approach fails? Are fallbacks provided?
- **Edge cases**: Are unusual but realistic scenarios covered?
- **Internal consistency**: Do instructions contradict each other anywhere?
