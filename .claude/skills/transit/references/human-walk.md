# Walking a person through human-only work

Loaded in HITL when the work needs a person's hands — a `mode:human` task, or the human-only part of a slice: a manual test, a third-party dashboard, an access grant, a credential. Never in AFK: gate 5 keeps these tickets out.

## Contents

- [Scope the steps](#scope-the-steps)
- [Pick the form per step](#pick-the-form-per-step)
- [Terminal wizard](#terminal-wizard)
- [In-session steps](#in-session-steps)
- [Leaving mid-walk](#leaving-mid-walk)

## Scope the steps

Read before asking: the ticket, `.env.example` and the key names in `.env*` (never their values), every `secrets.*` and `vars.*` reference in `.github/workflows/`, and the docs the ticket names. Every value a later ticket depends on is some step's output.

Write the ordered step list. Per step: the goal; where the person goes — URL, screen path, or command; what they do there; the value it produces, where that value lands (`.env`, a GitHub secret or variable, the resolution comment, nowhere), and whether it is secret; and the check that proves it done. A click path or command you do not know is checked in its docs or named as unknown — never invented, because a step that does not exist stalls the person on the one screen you cannot see.

Show the list; the person may add, drop, or reorder. Then start.

Completion: every step has its check, and every captured value has a destination.

## Pick the form per step

| The step | Form |
|---|---|
| captures values, or walks a third-party dashboard — keys, ids, CI secrets | a terminal wizard |
| is a choice between options | a picker question |
| anything else — run a command, look at a screen, flip a setting | an in-session step |

Three or more steps are also mirrored as a session task list, one in progress at a time, so the person sees what is left.

Secrets — keys, tokens, passwords — are never asked for or pasted in chat. They go through the wizard or the person's own editor; anything typed into the chat stays in the transcript and the session logs.

## Terminal wizard

A throwaway bash script in the session scratchpad; commit it only when the person wants a repeatable setup path.

- One stage per focused task: clear the screen, show `Stage n/N · <name>`, so nothing the person needs scrolls away.
- Open the URL before asking for the value it shows. Secret input is hidden (`read -rs`).
- Persisted values are upserted into `.env` — drop the key's old line, append the new one — so a re-run is safe. Values CI needs go through `gh secret set` / `gh variable set`, and only those.
- A `y/N` confirm before any irreversible action. A closing summary: keys written, secrets set, what is still to do by hand.
- Check it with `bash -n` (and `shellcheck` when installed) and trace it statically: every value from the scope lands where the scope said, and every secret name matches a `secrets.*` reference. Never run it yourself — it waits on a person.

Hand over one command to run. When the person says it finished, run each stage's check yourself: `grep -c '^KEY=' .env` (the count, never the value), `gh secret list`, or the command the step enabled.

## In-session steps

One step at a time: the goal in one line; the exact steps with paths, commands, and values in full; what done looks like; the check you will run. Then, alone on the turn:

```text
(d)one / (s)kip / (b)locked
```

On `(d)`: run the check. It passes → mark the step done and move on; it fails → show the output and ask again. On `(s)`: comment "skipped by the user on <date>" on the ticket. On `(b)`: ask what blocks it in one question, record the answer on the ticket, move on. Never present the next step before the current one is answered.

## Leaving mid-walk

A person who leaves gets the release comment: the remaining steps verbatim, what each produces, and the values already captured by name, never by value. The next run resumes from that list.

Completion: every step done, skipped, or blocked with its reason on the ticket, and every resulting fact a later ticket depends on — key names, URLs, ids, never secret values — in the resolution comment.
