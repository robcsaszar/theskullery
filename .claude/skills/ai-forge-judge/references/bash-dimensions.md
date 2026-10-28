# Bash/Shell Guidance Evaluation Dimensions (B1–B3)

Detailed scoring rubrics for dimensions that apply when evaluating prompts containing shell/CLI guidance — bash rules, command restrictions, or terminal behavior constraints.

---

## B1: Rule Specificity & WHY (10 points)

Are shell rules concrete enough to be actionable, and do they explain the non-obvious reason behind each constraint?

| Score | Criteria |
|-------|----------|
| 0–3 | Vague warnings with no specifics ("be careful with commands") |
| 4–6 | Rules name specific constructs but lack meaningful WHY |
| 7–8 | Specific rules with WHY, but WHY is sometimes obvious or generic |
| 9–10 | Every rule names the exact construct AND explains the non-obvious failure mode |

**Strong rule** (specific + non-obvious WHY):

```markdown
NEVER chain Bash commands with && or ; — the safety check fires
on ambiguous multi-command calls and interrupts mid-flow without warning.
Run each command as a separate tool call.
```

**Weak rule** (vague, no WHY):

```markdown
Be careful with bash commands.
Avoid complex shell operations.
```

**What to check**:

- [ ] Does each rule name the specific command, flag, or pattern to avoid?
- [ ] Does the WHY explain what actually goes wrong — not just "it's dangerous"?
- [ ] Is the failure mode specific to THIS environment vs. generic?
- [ ] Are rules written as imperatives, not suggestions?

---

## B2: Anti-Pattern Coverage (10 points)

Do the rules cover the real failure modes in this environment?

| Score | Criteria |
|-------|----------|
| 0–3 | Rules cover obvious, generic hazards only (rm -rf, sudo) |
| 4–6 | Some environment-specific rules but notable gaps |
| 7–8 | Good coverage of real failure modes with few gaps |
| 9–10 | Comprehensive coverage of environment-specific anti-patterns |

**Known environment-specific failure modes to check for**:

- `&&` / `;` chaining — interrupts safety check mid-flow
- `|` (pipe) — stops execution without warning
- `$()` command substitution — triggers permission prompts
- `echo` / `cat` for file content — use Write/Read tools instead
- External runtimes (python3, jq, curl) when built-in tools can do it
- `find`, `grep`, `cat` — use dedicated tools instead
- Interactive flags (-i) in git commands — not supported in non-interactive shell

**What to check**:

- [ ] Are the failure modes specific to the actual environment?
- [ ] Are there gaps — common patterns in this context that aren't covered?
- [ ] Do the rules cover both the what (what to avoid) and the instead (what to do instead)?

---

## B3: Scope & Exceptions (10 points)

Are rules correctly scoped — neither over-broad nor under-broad? Are exceptions and alternatives stated?

| Score | Criteria |
|-------|----------|
| 0–3 | Rules apply universally with no exceptions, or are so narrow they miss real cases |
| 4–6 | Scope is mostly right but some rules are over- or under-broad |
| 7–8 | Well-scoped rules with most exceptions covered |
| 9–10 | Precise scope throughout, alternatives provided, exceptions explicit |

**What to check**:

- [ ] Does each rule say when it applies if it's conditional?
- [ ] For NEVER rules, is there an alternative approach provided?
- [ ] Are there cases where the rule should not apply that aren't covered?

**Good scoping**:

```markdown
NEVER use | (pipe) in shell commands — execution stops when it encounters a pipe.
If you need filtered output, redirect with > to a temp file and read it back.

Note: | in markdown table row syntax is unaffected.
```

**Over-broad**:

```markdown
NEVER run any command that modifies state.
```

**Under-broad**:

```markdown
Be careful with the pipe character.
```
