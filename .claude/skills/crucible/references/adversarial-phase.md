# Adversarial & Verification Phase — Agent Contracts

## Independence Boundary

The refuter receives its domain's finding JSON and `codebase-map.md`; the verifier receives claim lines drawn from the findings. Neither receives:

- The recon agent's prose reasoning
- Findings from other domains
- Any context about what the recon agent "intended"

Violating the independence boundary collapses the adversarial review into a rubber stamp.

---

## Adversarial Brief (Phase 2 — `refuter`)

One `refuter` per batch of at most six findings from one domain. Its standing rules, verdicts, and report shape live in `.claude/agents/refuter.md`; the brief carries only the claims and the map. Replace `[CODEBASE_MAP]` and `[FINDINGS_JSON]`.

```text
Repo: <path>. Disprove each finding below. Each is one claim; attack it alone.

Codebase context:
---
[CODEBASE_MAP]
---

Findings (claims), one JSON object each, id first:
[FINDINGS_JSON]
```

## Verdict Mapping

| Refuter verdict | `findings.json` |
|---------|--------|
| SURVIVED | `adversarial_verdict: "confirmed"` |
| DOWNGRADED to `<severity>` | `adversarial_verdict: "downgraded"`, `severity` updated |
| REJECTED | entry replaced by `{verdict: "rejected", id, domain, title, reason}`, `reason` = its evidence |

`adversarial_notes` takes the refuter's ATTACKED, STRONGEST OBJECTION, and COULD NOT EXAMINE lines — a SURVIVED finding is stored as `confirmed`, so the objection it survived must travel with it. After all verdicts are written, run the schema validator. Rejected findings must still appear in findings.json (with `verdict: "rejected"`) — the record of what was disproved is part of the audit trail.

---

## Verification Brief (Phase 4 — `verifier`)

One `verifier` over every confirmed finding's literal claims; its rules and report shape live in `.claude/agents/verifier.md`. One line per claim, ids as `<finding id>.<n>`:

```text
Repo: <path>. Verify these claims:

<id>.1 <files[0].path>:<files[0].lines[0]> — `<quote>`
<id>.2 <files[0].path>:<files[0].lines[0]> — the <component named in root_cause>
```

A finding without a `quote` gets claim `.2` only. Map each verdict back to its finding: VERIFIED → `verification: "verified"`; CORRECTED → apply the new line to `files`, `"corrected"`; REJECTED → entry replaced by `{verdict: "rejected", id, domain, title, reason}`; UNSURE → read the candidates yourself and settle it.

The PATTERN check — does the pattern `fix_approach` describes still appear in the current code — is the orchestrator's own read, not the verifier's: deciding whether code matches a described pattern is interpretation.

## Reconciliation Rule

After applying all Phase 4 corrections:

- `PLAN.md` and `findings.json` must agree on every file path, line number, and severity
- If a finding was CORRECTED, update both files
- If a finding was REJECTED in Phase 4, remove it from PLAN.md and change its verdict in findings.json
- Run schema validation one final time before writing SPEC.md

A human-readable PLAN that disagrees with the machine-readable findings.json is a defect in the skill output.
