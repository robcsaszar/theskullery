# Common Failure Patterns

Failure patterns for all prompt types. Patterns 1–9 apply primarily to Skills. Patterns 10–13 apply to agent definitions / system prompts. Patterns 14–15 apply to bash/shell guidance.

---

## Pattern 1: The Tutorial

```text
Symptom: Explains what PDF is, how Python works, basic library usage
Root cause: Author assumes prompt should "teach" the model
Fix: Claude already knows this. Delete all basic explanations.
     Focus on expert decisions, trade-offs, and anti-patterns.
```

### Pattern 2: The Dump

```text
Symptom: SKILL.md is 500+ lines with everything included
Root cause: No progressive disclosure design
Fix: Core routing and decision trees in SKILL.md (<200 lines ideal)
     Detailed content in references/, loaded on-demand
```

### Pattern 3: The Orphan References

```text
Symptom: References directory exists but files are never loaded
Root cause: No explicit loading triggers
Fix: Add "MANDATORY — READ" at workflow decision points
     Add "Do NOT Load" to prevent over-loading
```

### Pattern 4: The Checkbox Procedure

```text
Symptom: Step 1, Step 2, Step 3... mechanical procedures
Root cause: Author thinks in procedures, not thinking frameworks
Fix: Transform into "Before doing X, ask yourself..."
     Focus on decision principles, not operation sequences
```

### Pattern 5: The Vague Warning

```text
Symptom: "Be careful", "avoid errors", "consider edge cases"
Root cause: Author knows things can go wrong but hasn't articulated specifics
Fix: Specific NEVER list with concrete examples and non-obvious reasons
```

### Pattern 6: The Invisible Skill

```text
Symptom: Great content but skill rarely gets activated
Root cause: Description is vague, missing keywords, or lacks trigger scenarios
Fix: Description must answer WHAT, WHEN, and include KEYWORDS

Example fix:
BAD:  "Helps with document tasks"
GOOD: "Create, edit, and analyze .docx files. Use when working with
       Word documents, tracked changes, or professional document formatting."
```

### Pattern 7: The Wrong Location

```text
Symptom: "When to use this Skill" section in body, not in description
Root cause: Misunderstanding of three-layer loading
Fix: Move all triggering information to description field
     Body is only loaded AFTER triggering decision is made
```

### Pattern 8: The Over-Engineered

```text
Symptom: README.md, CHANGELOG.md, INSTALLATION_GUIDE.md, CONTRIBUTING.md
Root cause: Treating Skill like a software project
Fix: Delete all auxiliary files. Only include what Agent needs for the task.
```

### Pattern 9: The Freedom Mismatch

```text
Symptom: Rigid scripts for creative tasks, vague guidance for fragile operations
Root cause: Not considering task fragility
Fix: High freedom for creative (principles, not steps)
     Low freedom for fragile (exact scripts, no parameters)
```

---

### Pattern 9a: The Trigger Collision

```text
Symptom: Two skills in the same roster have descriptions that match the same requests;
         neither fires reliably, and which one wins looks random to the user
Root cause: Descriptions written in isolation. Each is fine alone; nobody compared them
Fix: Differentiate on the axis that actually separates them (input type, output type,
     lifecycle stage), then add reciprocal negative triggers — each names the other
Detect: ai-forge-audit Phase 0 flags description keyword overlap above 0.4
```

---

### Pattern 9b: The Workflow Summary

```text
Symptom: Skill fires, agent produces something shaped roughly right, but the body's
         actual steps were never followed
Root cause: The description narrates the workflow ("Analyzes X, then generates Y, then
            validates Z"). That is enough to act on, so the agent acts on it and never
            opens the body
Fix: Description states trigger CONDITIONS only — when to load it, not what it does.
     The body is where the procedure lives
```

---

### Pattern 10: The Contradiction (Agent / system prompts)

```text
Symptom: Two sections govern the same scenario with different outcomes
Root cause: Rules added incrementally without auditing existing rules
Fix: Before adding a rule, search for existing rules on the same topic
     When conflict found, make scope explicit: "when X, prefer A; when Y, prefer B"
```

### Pattern 11: The Default Restatement (Agent / system prompts)

```text
Symptom: Rules that tell the model to do what it already does by default
Root cause: Author writing rules without asking "would Claude do this anyway?"
Fix: Test each rule — if yes, delete it
```

### Pattern 12: The Scope Wall (Agent / system prompts)

```text
Symptom: Dozens of rules covering every conceivable situation
Root cause: Trying to eliminate all uncertainty through exhaustive rules
Fix: Cover the 5–10 failure modes that actually recur; trust model defaults elsewhere
```

### Pattern 13: The Prose Wall (Agent / system prompts)

```text
Symptom: Rules buried in paragraphs with no sectioning or list structure
Root cause: Writing for human reading, not for LLM inference
Fix: Break into labeled sections, use bullet lists for distinct rules
     Each rule should be independently parseable
```

---

### Pattern 14: The Generic Shell Warning (bash/shell guidance)

```text
Symptom: "Be careful with shell commands" / "avoid dangerous operations"
Root cause: Author knows bash can be risky but hasn't articulated specifics
Fix: Name the exact construct and the exact failure in this environment
```

### Pattern 15: The Missing Alternative (bash/shell guidance)

```text
Symptom: NEVER rule with no replacement — "don't do X" but not "do Y instead"
Root cause: Author focused on prohibition, not on enabling correct behavior
Fix: Every NEVER should have an INSTEAD
```
