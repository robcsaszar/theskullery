# Review Checklist — Sections 1–7

Detailed questions for the Review Sequence. Work through in order, one question at a time. Skip sections that don't apply per the scope table in SKILL.md.

---

## 1. Purpose & Scope

- Can you explain what this agent does in one sentence without using the word "help"?
- What is the single most important thing this agent must get right?
- What should this agent explicitly refuse to do?
- Is this actually an agent (needs autonomy/tools) or would a simpler prompt template suffice?

> **Why this matters:** Vague purpose leads to unpredictable behavior. If you cannot crisply define what it does, the model definitely cannot either. Many "agents" are over-engineered — a well-crafted prompt with no tools often outperforms a poorly-defined agent with many tools.

---

## 2. Model Selection

- Which model is specified? If none, that is a red flag — call it out.
- Does the task complexity match the model capability? Use this guide:

  | Tier | Model | Best for |
  |------|-------|----------|
  | Fast/cheap | Claude Haiku 4.5 | Routing, classification, simple extraction, high-volume/low-stakes |
  | Balanced | Claude Sonnet 4.6 | Most coding tasks, analysis, general-purpose work |
  | Powerful | Claude Opus 4.6 | Complex reasoning, nuanced judgment, costly-error tasks |

- Could this be done with a cheaper/faster model? Challenge the default "use the best" instinct.

> **Why this matters:** Wrong model selection wastes money at scale and can degrade quality — a model too powerful may overthink simple tasks.

---

## 3. Instructions & Prompt Quality

- Are the instructions specific enough that two different people would interpret them the same way?
- Read the instructions as if deliberately trying to misunderstand them. What would you do?
- Are there weasel phrases? ("appropriately", "as needed", "when relevant", "ensure quality") — these mean nothing to a model.
- Is there a clear output format defined?
- If AI-generated: are there confident-sounding claims that might be hallucinated?

> **Why this matters:** LLMs follow instructions literally. Ambiguity gets randomly interpreted on every run.

---

## 4. Tools & Permissions

- List every tool/permission. For each: what is the worst thing that could happen if misused?
- Are permissions scoped to the minimum needed?
- Are there tools that can cause irreversible changes? If so, is there a human-in-the-loop step?
- Are there tools listed that the agent doesn't need for its stated purpose?

> **Why this matters:** Tools are the difference between an agent that says wrong things and an agent that does wrong things.

---

## 5. Context & Input Handling

- What inputs does this agent receive? Can any be adversarial or malformed?
- Is there prompt injection risk?
- Is the context window being used efficiently?
- If the agent reads files or external data: what happens when that data is unexpected, empty, or huge?

> **Why this matters:** Agents that process external input inherit the trustworthiness of that input.

---

## 6. Failure Modes & Recovery

- What happens when the model hallucinates? How would you detect it?
- What happens when an API call or tool use fails?
- Is there a timeout or iteration limit?
- What does "graceful failure" look like? Is it defined?
- Who gets notified when something goes wrong?

> **Why this matters:** Every agent will fail. The question is whether it fails loudly and recoverably or silently and destructively.

---

## 7. Testing & Observability

- How will you know if this agent is working correctly?
- Do you have example inputs with expected outputs?
- Are agent decisions logged for reconstruction?
- Have you tested with adversarial/edge-case inputs?

> **Why this matters:** You cannot improve what you cannot observe.

---

## 8a. Skill Directory Structure (SKILL.md reviews only)

- Are there any non-SKILL.md *files* at the skill root? If yes, flag each one. A purpose-named directory is not a stray file — `evals/` and `benchmarks/` are expected on any skill that carries an eval suite, and flagging them is a false positive.
- Documentation files (.md loaded on demand) → must be in `references/`
- Executable scripts (.js, .mjs, .cjs, .sh) → must be in `scripts/`
- Data files, JSON schemas, templates → must be in `assets/`
- Eval suites and fixtures → `evals/`; committed benchmark baselines → `benchmarks/`
- Does `SKILL.md` reference any of these files with a root-relative path (e.g. `[foo.md](foo.md)`)? Update to the correct subdirectory path.
- Is the description written in third-person imperative? ("Creates…", "Analyzes…" — not "I can…", "Helps you…")
- Does the description include negative triggers ("Don't use for…")?
- Are all references exactly 1 level deep from `SKILL.md`? (no chained references: `SKILL.md → a.md → b.md`)

> **Why this matters:** Files at the skill root are ambiguous — the spec defines purpose-named directories for a reason. Misplaced files signal the author didn't read the spec and may indicate other structural gaps.
