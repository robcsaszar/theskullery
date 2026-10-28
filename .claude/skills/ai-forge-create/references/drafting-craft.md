# Drafting Craft

Techniques for writing the body once the description and pattern are settled. Loaded in Phase 3.

## Contents

- [Leading words](#leading-words)
- [Degrees of freedom](#degrees-of-freedom)
- [Completion criteria](#completion-criteria)
- [NEVER rules format](#never-rules-format)

## Leading words

A _leading word_ is a compact pretrained concept that anchors a region of behaviour — e.g. _fog
of war_, _tracer bullets_, _red loop_. Repeat the token, not the meaning. Each repetition
recruits the model's existing priors and accumulates a distributed definition without spending
definition tokens.

Leading words serve double duty: in the body they anchor execution (same behaviour each run); in
the description they anchor invocation (a description that shares a word with the user's prompt
triggers more reliably — use the exact words you would type when triggering the skill).

Hunt for collapses: "fast, deterministic, low-overhead" → _tight_. Every collapse is tokens
freed and the agent's hook sharpened.

## Degrees of freedom

Match specificity to task fragility:

| Freedom | Form | When |
|---------|------|------|
| High | Text instructions | Multiple valid approaches; context decides |
| Medium | Pseudocode or parameterised scripts | Preferred pattern with acceptable variation |
| Low | Exact scripts, no parameters | Fragile ops, must-follow sequence, data migrations |

A code review needs High. A database migration needs Low.

**Calibrate per section, not per artifact.** Freedom decreases as the artifact moves from
thinking to acting: analysis tolerates latitude, planning less, execution least. An artifact
that spans all three needs all three settings. Getting it wrong in either direction has a
signature — low freedom everywhere is brittle and breaks on unexpected input; high freedom
everywhere produces inconsistent output with no quality floor.

## Completion criteria

Every step ends on a completion criterion — the condition that tells the agent the work is done.
Make it **checkable** (can the agent tell done from not-done?) and **exhaustive** ("every
modified file reviewed", not "produce a list"). A vague criterion invites premature completion:
visible later steps pull the agent forward before the current one is finished. If a criterion is
irreducibly fuzzy and rushing is observed, split the sequence — hide later steps in a separate
Phase or file so they are not yet in context.

## NEVER rules format

A prohibition is a last resort, not a quality signal. Before writing one, try explaining the
reasoning instead — a model that understands why a constraint exists honours it in cases the
rule never anticipated, and a wall of prohibitions where an explanation would do reads as rigor
while delivering less of it.

When a prohibition is genuinely the right form (the failure-form table in
[`baseline-probe.md`](baseline-probe.md) says when), it must carry all three parts:

```text
- **NEVER [specific construct/pattern]**
  **Instead:** [concrete alternative]
  **Why:** [non-obvious failure mode this avoids]
```

Vague warnings ("be careful", "avoid errors") are prohibited. So is a prohibition whose **Why**
restates the rule — if the reason is obvious, the rule is redundant with what the model already
does.
