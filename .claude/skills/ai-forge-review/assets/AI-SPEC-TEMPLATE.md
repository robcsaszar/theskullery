# AI Definition Spec: [Name]

This is an **optional** reference for thinking through agent design before or after a review.
You do not need to fill this out to use `ai-forge-review` — just say "review my agent"
and the skill will walk you through everything interactively.

Use this template if you prefer to think on paper first, or keep a filled-out copy as
documentation after the review is complete.

**Type:** Agent _(this template is for agents only — skills don't need this level of documentation)_

> **Ground every section or omit it.** A section you cannot answer from the user's own words, a
> baseline transcript, or a review finding should be deleted, not filled with something
> plausible. An invented requirement reads exactly like a real one and outlives the guess.
>
> **The test:** could someone with no memory of the conversation build this agent from this
> document alone?

---

## Purpose

**What it does (one sentence):**

> _e.g. "Validates all config JSON files against their schema and reports violations."_

**What it must never do:**

> _e.g. "Never auto-fix or overwrite files without explicit user confirmation."_

---

## Requirements

Tag each requirement by where it came from. Untraceable requirements are the ones that get
built and never used.

| ID | Requirement | Source |
| --- | ----------- | ------ |
| R1 | _Stated outright by the user_ | _"...", their words_ |
| R2 | _Implied but never said_ | _inferred from ..., confirm before building_ |
| R3 | _Discovered during review or baseline_ | _baseline run 2 / review finding #4_ |

R2 rows are assumptions until someone confirms them. Mark any that are still unconfirmed.

---

## Key Decisions

Every non-obvious choice, with the alternative you rejected. The rejected column is the one
that pays off later — it stops the same debate being reopened in six months.

| Decision | Choice | Why | Alternative rejected because |
| -------- | ------ | --- | ---------------------------- |
|          |        |     |                              |

---

## Model Configuration

| Setting     | Value | Justification                                                     |
| ----------- | ----- | ----------------------------------------------------------------- |
| Model       |       | _e.g. Sonnet tier — balanced cost/quality for coding tasks_       |

Match model cost to error cost:

| Tier         | Best for                                           |
| ------------ | -------------------------------------------------- |
| Fast/cheap   | Routing, classification, simple extraction         |
| Balanced     | Most coding tasks, analysis, general-purpose       |
| Powerful     | Complex reasoning, nuanced judgment, costly errors |

Use family aliases, never dated model IDs — a pinned date breaks the agent on a schedule
nobody wrote down.

---

## Tools & Permissions

| Tool / Permission | Why it is needed | What could go wrong | Mitigation |
| ----------------- | ---------------- | ------------------- | ---------- |
|                   |                  |                     |            |

---

## Instructions Review Checklist

- [ ] Another person interpreted the instructions the same way I intended
- [ ] No weasel words ("appropriately", "as needed", "ensure quality")
- [ ] Output format is explicitly defined
- [ ] If AI-assisted: I verified all referenced tools/APIs actually exist
- [ ] Instruction files loaded lazily, not all at once
- [ ] Output format is compatible with downstream agents (if pipeline)
- [ ] Tested against a representative scenario for the domain's riskiest configuration

---

## Failure Modes

**If the model hallucinates, what happens?**

**If a tool call fails, what happens?**

**Is there an iteration/cost limit?**

**Who gets notified on failure?**

---

## Context Window Strategy

**Must this agent run in its own chat session?** (Yes for pipeline agents)

**Which instruction files does it load?**

| Instruction file                  | Load strategy | When needed                      |
| --------------------------------- | ------------- | -------------------------------- |
| _e.g. typescript.instructions.md_ | _Lazy_        | _During TS implementation phase_ |

---

## Pipeline Integration

**Is this agent part of a spec-driven pipeline?** (Yes / No / Standalone)

**Input contract** — what does it receive?
> _e.g. "An approved spec file at `specs/<ticket-id>.md`"_

**Output contract** — what does it produce?
> _e.g. "Code changes committed to a feature branch, spec status updated to `done`"_

**Handoff mechanism:** (spec file / git history / other)

---

## Domain Configuration Impact

**Does this agent touch settings, locales, or environment-specific config?** (Yes / No)

If yes:

- Does it understand the project's config merge/override hierarchy?
- Which variants, tenants, or brands are affected?
- Does it reference the canonical config type for type safety?

---

## Blast Radius

**If this agent goes completely wrong, what is the worst realistic outcome?**

**Is that outcome reversible?**

**Does it overlap with an existing agent or skill?**

Run `ai-forge-audit`'s Phase 0 coherence pass rather than eyeballing it — trigger collisions
between two well-written definitions are exactly what a manual scan misses.
