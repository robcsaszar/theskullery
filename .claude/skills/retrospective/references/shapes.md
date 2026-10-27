# Session Shapes

The shape a session takes is chosen — well or badly — in its first few turns.
Expert sessions are not longer or harder; they are structured right from the
start, and the right shape picked upfront removes the backtracking, scope
drift, and aimless reading that fill a context window before the first useful
output. Use these as models when a session begins, and as the frame when
scoring one that just ran.

These shapes are host-neutral. Name the plans, skills, or workflows the project
actually uses; do not assume any one tool's command names.

---

## Score key (1–10)

Score the **session's shape and execution** — not the difficulty of the task,
and not the operator's domain expertise.

| Score | Meaning |
|-------|---------|
| 10 | Textbook shape. Cheap locate, batched tools, no state rebuilt. Output matches the entry signal. |
| 8–9 | Right shape, one or two small wastes — an extra whole-file read, one unbatched sweep. |
| 6–7 | Right-ish shape, or the right shape with notable waste: a wrong fork later corrected, unbatched gathering, state rebuilt once. |
| 4–5 | Wrong shape for the entry signal, or real backtracking and scope drift. The work landed, but expensively. |
| 1–3 | Reading with no output, state rebuilt again and again, reading-to-find instead of locating first, or a session that never named its own shape. |

A lean session can still score 8–10. Say it was lean and name the one thing
that kept it lean; never invent a number to justify the score. A session that
shipped a user-facing surface nobody looked at caps at 6, whatever else it
did — the cap overrides the table above.

---

## Scope-then-Build

**Pattern:** think → structure → do. **Entry signal:** "I want to build X" —
no durable plan exists yet and the work spans several files.

**Flow:** an optional read-only explore if the ground is unfamiliar, written to
a durable brief rather than left in chat; a plan or spec produced and paused for
a human read when the change is non-trivial; then implementation against that
plan as one logical unit of work.

**Expert version:** the full scope is stated upfront, the plan is generated in
one pass and read once, and execution never reopens design.

**Failure mode:** coding before planning, so scope drifts mid-build and one
logical change fragments into many.

**Preconditions:** a one-sentence scope before starting; clear in/out
boundaries; enough knowledge to skip the explore, or a brief already written.

---

## Run-the-Plan

**Pattern:** load → classify → do. **Entry signal:** "ship it" / "implement the
tasks" — a reviewed plan already exists.

**Flow:** load **all** the plan's artifacts (not just the task list) before
writing anything; execute in the right order — sequential for a few dependent
tasks, parallel waves for independent ones; verify, then ship as one unit.

**Expert version:** pure execution. Zero exploration, zero new design. Read
everything before writing anything.

**Failure mode:** implementing from the task list without the design, then
making choices that contradict the plan, or rebuilding the plan from the code
instead of reading it.

**Preconditions:** the plan exists and was reviewed; tasks carry acceptance
criteria.

---

## Survey-then-Propose

**Pattern:** understand → capture → structure. **Entry signal:** "how does X
work? I might need to change it" — understanding must land before a design is
committed.

**Flow:** read-only investigation, fanning out across subsystems when the
question spans them, preferring an index if the project has one; a durable brief
written; then understanding turned into a plan the next session can open instead
of rediscovering the same files.

**Expert version:** the investigation writes something that survives a context
reset or a tool swap, and the proposal consumes that brief.

**Failure mode:** exploring in one long chat where the findings live only in
history and vanish, and understanding never becomes a plan — so the next session
pays the same cost again.

**Preconditions:** several modules genuinely involved; a question specific
enough to decompose; prior briefs checked first.

---

## Pinpoint Fix

**Pattern:** locate → fix → verify. **Entry signal:** "X is broken" / "fix the
error in Y" — a specific defect, narrow scope.

**Flow:** check what is already known about the area (recent commits, notes,
constraints); locate the fault by a search or a failing-test span, not a
whole-file sweep; fix it; run the relevant tests; ship, or report back if the
fix turns out broader than it looked.

**Expert version:** the constraint is already known, so the session goes
straight to the fault and verifies immediately.

**Failure mode:** guessing without reading the constraints, trying three wrong
approaches, exploring broadly when the fix is one function, or skipping the
tests.

**Preconditions:** the error is specific (not "something is slow" — that is
Survey-then-Propose); the scope is genuinely one file or one concept.

---

## Orchestrated Run

**Pattern:** a script holds the flow, agents do the slices. **Entry signal:**
complex work that benefits from deterministic orchestration — a reviewed change
ready to ship, a large independent task set, a structured review.

**Flow:** launch the project's workflow or orchestrator rather than a
hand-rolled loop in chat; independent tasks run in parallel while dependent ones
wait on gates; intermediate results stay in the script's state or on disk, not
in the conversation.

**Expert version:** the script holds the plan and the retry logic; the model
does slices. Nothing is re-implemented inline.

**Failure mode:** rebuilding a workflow's job turn by turn in chat — context
fills, results vanish — or using orchestration for work that is sequential or
needs a human decision between steps.

**Preconditions:** tasks parallelize without colliding, or the orchestrator
serializes the collisions; verification commands exist; a plan already cleared
its human checkpoint.

---

## Contested Inquiry

**Pattern:** debate → converge → decide. **Entry signal:** an unclear root
cause, or a decision with genuinely competing approaches, where the value is in
agents **challenging each other** rather than reading in silent parallel.

**Flow:** several investigators, each on a hypothesis or angle; they work
independently **and** refute one another; the lead synthesizes what survived
into a decision or a plan.

**Expert version:** unlike a silent fan-out, the agents communicate, and that
communication is the product.

**Failure mode:** using a team for mechanical parallelism, where a workflow
would be cheaper and more predictable. A team is worth its coordination cost
only when the agents need to talk.

**Preconditions:** the host can run parallel agents that share findings; more
than one plausible cause or approach genuinely exists.

---

## Selection heuristic

Start with the simplest shape that fits, and let it change as the work reveals
itself.

```text
Specific error + narrow scope                  → Pinpoint Fix
"Ship the tasks" + reviewed plan               → Run-the-Plan
"Build X" + clear scope                        → Scope-then-Build
"How / why / what if" + broad scope            → Survey-then-Propose
Reviewed change ready, or a large parallel set → Orchestrated Run
Unclear root cause + competing theories        → Contested Inquiry
```

If Pinpoint Fix uncovers a scope broader than one function, escalate to
Survey-then-Propose. If Scope-then-Build meets an already-reviewed plan,
downgrade to Run-the-Plan. Classification is a starting point, not a vow — but a
session that never classified itself at all is scored as if it drifted, because
it did.

**Workflow versus team:** tasks independent and orchestration known → a
workflow (deterministic, cheaper); agents that must challenge or negotiate → a
team.
