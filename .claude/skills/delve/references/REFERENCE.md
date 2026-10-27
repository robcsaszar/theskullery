# Research assistant — extended reference

## Multi-source subagent prompt template

Use this when spawning parallel research subagents. One invocation per source; all spawned in the same message.

```text
Fetch [URL] and any linked sub-pages that contain additional detail on [topic].
For each page fetched, extract ALL of the following (exact values, not paraphrases):
  1. [Category 1] — e.g. file naming convention
  2. [Category 2] — e.g. required folder structure
  3. [Category 3] — e.g. frontmatter YAML schema — every field, type, required/optional, allowed values, defaults
  4. [Category N] — ...

Quote spec details verbatim where possible.
Spawn child fetches for linked pages if they appear to be the primary reference for [topic];
skip tangential or overview pages.
Return a structured markdown report with one section per category.
```

**Extraction schema discipline:**

- Define categories before spawning — all subagents must use identical categories
- Categories drive synthesis: same structure per source = mechanical comparison, not re-reading
- Include a catch-all: "Platform-specific quirks and gotchas" as the final category so each agent surfaces non-obvious constraints that don't fit the schema

**Bounded recursion rule:**

One hop from the main page is the default. Go deeper only when: (a) the main page is an index with no spec content, or (b) a linked page is explicitly the primary spec document. Agents use judgment — do not prescribe a fixed depth limit in the prompt, since that leads to stopping at the wrong point.

**Synthesis pattern:**

After all subagents return: (1) identify fields present in all sources — these become the universal schema rows; (2) identify fields present in only some sources — note as platform-specific; (3) flag contradictions or mutual exclusions; (4) produce unified output (taxonomy, comparison table, or combined reference file).

---

## Techniques from Anthropic hallucination guardrails

### Direct quote extraction (for documents >20k tokens)

Before analysis, extract relevant verbatim quotes first:

```text
1. Extract exact quotes from the source most relevant to [topic].
   If no relevant quotes found, state "No relevant quotes found."
2. Use only those quotes (referenced by number) to draw conclusions.
```

### Citation verification loop

After generating a response:

```text
Review each claim. For each:
- Find a direct quote that supports it.
- If no supporting quote exists, remove the claim and mark with [RETRACTED].
```

### Chain-of-thought verification

Ask Claude to reason aloud step-by-step before concluding. Visible reasoning surfaces:

- Faulty assumptions
- Gaps in logic
- Over-extrapolation from thin evidence

### Best-of-N consistency check

For high-stakes research: run the same question multiple times.
Inconsistencies across runs = potential hallucination signal.

### External knowledge restriction

When documents are provided:

```text
Use only information from the provided documents.
Do not draw on general knowledge unless you explicitly label it as "[general knowledge, not from source]".
```

---

## Analogy discipline

When explaining with analogies, always structure as:

**Analogy A:** [description]

- Illuminates: [what this makes clearer]
- Distorts: [what this hides or misrepresents]

**Analogy B:** [description]

- Illuminates: [what this makes clearer]
- Distorts: [what this hides or misrepresents]

Leave comparison to the user.

---

## Falsifiability prompts

After building an explanation or theory, ask:

- "Under what conditions would this be wrong?"
- "What would we expect to observe if this explanation were a hallucination?"
- "How would we design an experiment to test this?"
- "What evidence would change your mind about this?"

---

## Confidence vocabulary

| Label | Meaning |
|---|---|
| [high] | Well-established, multiply sourced, low risk of error |
| [medium] | Reasonable confidence, some uncertainty remains |
| [low/uncertain] | Plausible but not well-grounded — verify before acting |
| [outside my reliable knowledge] | Don't trust this — search for ground truth |
| [simplification] | True directionally but loses important nuance |
| [analogy] | Useful frame, not a precise description |
| [speculation] | Logical extrapolation, not established fact |

---

## Assumption surfacing

At the start of complex analysis, surface embedded assumptions:

```text
Before answering, I'll note the assumptions your question rests on:
- [assumption 1] — is this correct?
- [assumption 2] — should I treat this as fixed or explore alternatives?
```

---

## Consistency (from Anthropic docs)

- Define terms when first used; don't let vocabulary drift within a session
- Break multi-part analyses into numbered subtasks
- If earlier answers conflict with new evidence: acknowledge explicitly, explain which to trust and why
- Use retrieval / provided context to anchor answers to a fixed information set rather than open-ended generation
