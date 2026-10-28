# Handoff Contract

A retrospective ends in durable notes, not just chat. Two formats: a **wire-in**
that folds a repeatable step back into an artifact the session already used, and
a **skill brief** for a repeatable procedure no existing artifact covers. Both
are handoffs for whoever owns the target — they do not change any skill
themselves.

**Where they go:** whatever handoff or notes directory the project already keeps
(look for one before inventing a path); otherwise `.agents/handoff/`. Every
write is best-effort — if the directory or the write is denied, say so in one
line and give the note inline instead. Never retry a denied write, never guess a
second path, and never block the reply on it.

**Naming:** `wire-in-<target>-<YYYYMMDD-HHMMSS>.md` and
`skill-brief-<slug>-<YYYYMMDD-HHMMSS>.md`.

Prefer a wire-in over a brief. Extending an artifact the session proved it needs
beats proposing a parallel one; reach for a brief only when nothing existing
fits.

---

## Wire-in note

Keep it short — roughly half a page. It must name a **real** target: the file
that actually runs. When the called skill is a thin launcher for a workflow
script, name the script, not the launcher — editing the launcher ships nothing.
For a plain skill, the SKILL.md prose is what runs. For an environment lever,
the target is the file the lever lands in — the entry steering file, the lint
or test config, the review-stage standards file, the tool wrapper — never a
skill that merely mentions it.

```markdown
# Wire-in: <target skill / workflow>

## Target
- file: <path to the file that actually runs, or that the lever lands in>
- lever: <skill step | navigation pointer | automated check | review-stage rule | steering trim | tool verbosity | information access>
- source: current session
- created: <ISO-8601>

## Evidence
<!-- What you did around the target this session, by hand, that should have been
     part of it. Cite the concrete moment; invent no quotes or counts. -->

## Wire-in
<!-- The concrete step, guardrail, or economy rule to add, and WHERE in the file. -->

## Payoff
<!-- The token or quality win next time, in relative terms. -->

## Blast radius
<!-- Who else calls this artifact or loads this file; what could regress. For a
     steering-file change, what every future session now pays or stops paying. -->
```

---

## Skill brief

For a repeatable procedure this session performed by hand that no existing skill
covers. Cap at the top three per retrospective; skip one-offs, pure chat, and
anything an existing skill already does (extend that instead). Treat the
procedure steps as hypotheses the author must refine — the brief captures
evidence, it does not write the skill.

```markdown
# Skill brief: <slug>

## Meta
- slug: <kebab-case proposed name>
- confidence: high | med | low
- created: <ISO-8601>
- evidence: current session (live context, no transcript re-read)

## Proposed skill
- name: <kebab-case>
- description: <what it does AND when to use it>
- when to use: <user phrases / contexts>
- when not to use: <overlaps, one-offs, better existing skills>

## Evidence
<!-- The concrete moments, the tool pattern, the shape and score you assigned.
     State plainly which procedure steps are inferred rather than observed. -->

## Procedure to encode
<!-- Ordered steps a SKILL.md should teach — hypotheses, in a locate -> act ->
     verify shape wherever it fits. -->

## Inputs / outputs / exit criteria
- inputs: <args, flags, natural-language triggers>
- outputs: <files written, chat shape>
- exit criteria: <checkable conditions>

## Related existing skills
<!-- Name overlaps and why this is not a duplicate — or "extend <skill>" and stop. -->

## Open questions
<!-- What the author must resolve before writing the skill. -->
```

Confidence: `high` = a repeated procedural shape with durable domain knowledge;
`med` = one strong session; `low` = thin signal. If unresolved open questions
remain, say so when handing the brief over.
