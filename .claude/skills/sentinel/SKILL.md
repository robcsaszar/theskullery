---
name: sentinel
description: 'Use for a security audit or security review of a web application codebase, when checking for vulnerabilities, hardening before a release or pen-test engagement, or working through the findings of an earlier audit. Covers XSS, SQLi, CSP and security headers, authn/authz, session and cookie handling, secrets management, rate limiting, error disclosure, and dependency CVEs. Produces a written markdown report with PASS / FAIL / MANUAL-REVIEW verdicts and file-and-line evidence, then drives remediation under per-item human approval. Not for general code review or style/architecture feedback — this skill is security-specific.'
disable-model-invocation: true
---

# Security Audit Skill

Rigorous static security audit of a web application codebase. Produces a written report with file:line evidence, then drives remediation: FAIL items fixed under per-item human approval, MANUAL-REVIEW items walked through with the user.

Phases 1–4 produce the report. Phases 5–6 act on it.

---

## Phase 1 — Stack Triage

Before scanning any code, answer these questions by reading `package.json`, config files, and `README`:

1. **Framework**: SvelteKit / Next.js / Express / FastAPI / etc.
2. **Database driver**: parameterized (libsql, pg, prisma) vs. raw string (low-level drivers)
3. **Auth mechanism**: JWT / HMAC tokens / sessions / OAuth
4. **Deploy target**: Fly.io / Cloudflare / Vercel / bare Node — determines which IP header to trust for rate-limiting and audit logs (`Fly-Client-IP` vs `CF-Connecting-IP` vs `X-Forwarded-For`); trusting the wrong one lets an attacker spoof their source IP. It also sets the crypto ceilings a codebase cannot exceed, so record it precisely enough to apply the platform notes in the checklist
5. **File uploads**: yes/no — if yes, where stored (local FS, S3-compatible, CDN)
6. **External outbound calls**: email API, webhooks, media fetch — potential SSRF surfaces
7. **Verification command**: the project's own definition of done (type-check, build, tests) — Phase 5 runs this after every fix

State your stack summary in one paragraph before Phase 2. Wrong assumptions here produce wrong findings.

---

## Phase 2 — Scan

MANDATORY READ: [`references/security-checklist.md`](references/security-checklist.md)

Do NOT load `references/security-checklist.md` for targeted single-endpoint reviews — it will expand scope beyond the task. Load it only for full-codebase audits.

Work through every category in the checklist in order — skipping a group requires a written reason in the report.

For each category:

- Read the relevant source file(s). Do not mark PASS from memory.
- If the file doesn't exist, mark MANUAL-REVIEW with a note.
- Record the verdict (PASS / FAIL / MANUAL-REVIEW) and one-line evidence note.

If the repo is too large to read every file, prioritise by risk: auth flows and token handling first, then input/output boundaries, then dependency config. Note which files were skipped.

---

## Phase 3 — Classify

Review your raw scan notes. For each item, apply the verdict rules:

- **PASS** — you read the relevant code and confirmed the control is in place. Cite file:line.
- **FAIL** — you found a confirmed, exploitable gap. You have a snippet. You can write a fix.
- **MANUAL-REVIEW** — the verdict requires runtime context, infrastructure access, or human judgment (e.g. "verify this token has read-only scope on the Turso dashboard").

> Before assigning a verdict, ask: "Can I write the remediation code right now, using only what I've read?" Yes → FAIL. No → MANUAL-REVIEW.

Do not downgrade a FAIL to MANUAL-REVIEW to soften the report.

### Capability probe

Run this before classifying anything MANUAL-REVIEW on the grounds that *you* can't do it. "Infrastructure" does not mean "the human does it" — the assumption is wrong often enough to cost a round trip every time.

1. **Credentials** — does `.dev.vars`, `.env`, or the environment already hold a token for this service? A database migration you were about to hand off may be one script away.
2. **CLI** — is a vendor CLI on PATH and authenticated (`gh auth status`, `turso auth whoami`, `wrangler whoami`)?
3. **Config as code** — is the setting expressible in a repo file (`wrangler.toml`, `_headers`, `dependabot.yml`) rather than a dashboard?

Then state the boundary explicitly in the finding. Three honest shapes:

| Shape | Say |
|---|---|
| Fully agent-doable | "I can do this now — credentials/CLI present." |
| Agent-doable with approval | "I can do this, but it writes to live infrastructure — confirm first." |
| Genuinely user-only | "You must do this — dashboard/account setting, no API or credential available to me." |

Never claim user-only without having run the probe, and never silently perform a live-infrastructure write without approval.

---

## Phase 4 — Report

Write the report to a local markdown file — this file is the deliverable, not the chat message.

**Path:** `plans/security-audit-YYYY-MM-DD.md` by default. If `plans/` doesn't exist, ask where it belongs rather than guessing. If a report for today already exists, ask: overwrite, or supersede with a note pointing at the prior file.

**Structure:**

1. Scope line — what was audited, what was excluded, and why.
2. Phase 1 stack triage paragraph.
3. Summary table: `| # | Category | Status | Notes |`
4. A finding block for every FAIL and MANUAL-REVIEW.
5. An explicit list of skipped files/routes with reasons.

**Finding block format:**

```text
### [N]. CATEGORY — FAIL
**File:** `src/lib/example.ts:42`
**Snippet:**
  cookies.set(name, token, { httpOnly: true })   // ← missing Secure flag
**Risk:** Cookie transmitted over plain HTTP in non-production; captured by passive MITM.
**Fix:**
  cookies.set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
```

MANUAL-REVIEW blocks replace **Fix** with **Action** (what the human must verify, and where).

PASS items appear only in the summary table — no blocks.

In chat, report the file path and a short verdict count. Do not paste the whole report back.

Then stop and ask what happens next — an audit-only run is a legitimate request, and Phases 5–6 are not automatic:

```text
Report written to <path>. N FAILs, M manual-review items.
(r)emediate now / (f)ails only / (m)anual only / (s)top here — report is the deliverable
```

The report stands on its own if they stop here. Do not begin fixing because fixes are available.

---

## Phase 5 — Remediate FAILs (HITL)

MANDATORY READ: [`references/remediation-workflow.md`](references/remediation-workflow.md)

Show the FAIL status board upfront, then offer `(s)tart per-item / (A)pply all / (Q)uit`.

For each item: announce → flag prerequisites (new env var, DB table, dependency, breaking change) → apply the smallest fix → run the Phase 1 verification command → show the diff → ask `(a)pprove / (r)evise / (s)kip / (A)pply-all / (Q)uit` → commit that finding alone on approval → update the board and the report file.

The commit comes after the answer, never before: `(r)evise` and `(s)kip` must leave no commit to unwind. Never mark an item fixed on an unverified change, and never bundle two findings into one commit.

---

## Phase 6 — Work through MANUAL-REVIEWs

One item at a time. Each block expands that finding's one-line **Action** from the report into working instructions — the report stays concise, this is where it becomes followable. Not a competing format; a zoom level.

**Where** (exact dashboard path, CLI command, or file), **Steps** (numbered), **What good looks like** (the expected state, so "checked it" is verifiable), and **Agent boundary** (what you can do versus what only the user can do — from the Phase 3 capability probe).

Capture a disposition for each — confirmed / fixed / accepted-as-is / deferred — with the user's reason where they gave one, and write it back to the report file. Close with a disposition summary and any operator actions still required before deploy.

---

## NEVER

- **NEVER mark PASS without reading the file**
  **Instead:** Read the file, cite file:line in the evidence note.
  **Why:** Memory-based PASS verdicts produce false assurance — the whole point of the audit is evidence.

- **NEVER mark FAIL without a code snippet**
  **Instead:** Quote the exact vulnerable line(s) from the file you actually opened. If you can't find a snippet, it's MANUAL-REVIEW.
  **Why:** A FAIL without evidence is assertion, not audit — developers need the exact location to fix it, and one finding that turns out to be invented discredits every other finding in the report.

- **NEVER conflate FAIL and MANUAL-REVIEW**
  **Instead:** FAIL = you can write the fix right now. MANUAL-REVIEW = you cannot, and you say why.
  **Why:** Mixing them destroys the actionability of the report.

- **NEVER declare an action user-only without running the capability probe**
  **Instead:** Check for credentials, an authenticated CLI, and config-as-code first, then state the boundary explicitly.
  **Why:** Handing back a task you could have done yourself wastes a round trip and pushes avoidable work onto the user.

- **NEVER mark a FAIL fixed without the verification command passing**
  **Instead:** Run the project's type-check/build/tests after each fix; revert or repair before marking it done.
  **Why:** A fix that doesn't compile isn't a fix, and stacking the next one on a broken tree makes the failure impossible to attribute.

- **NEVER treat a green build as verification for a fix that changes runtime behavior**
  **Instead:** For headers/CSP, auth, middleware, rate limits, or schema changes, exercise a real request — fetch the page, complete the login, run the query — before marking it done.
  **Why:** Type-check and build pass happily on a CSP that blanks every page in production; compile-time checks cannot see a request-time regression.

- **NEVER skip Phase 1 stack triage**
  **Instead:** Read `package.json` and one config file before scanning anything.
  **Why:** Which IP header to trust, which CSP approach is valid, and which auth model applies all depend on the stack — wrong assumptions cascade into wrong verdicts.

- **NEVER report remediation code that doesn't match the project's framework/library**
  **Instead:** Write fixes using the exact APIs already in use (e.g. SvelteKit `cookies.set`, not `res.setHeader`).
  **Why:** Generic remediation that doesn't compile is ignored; framework-specific fixes get merged.

- **NEVER silently skip files in a large repo**
  **Instead:** Prioritise by risk (auth/token handling → input/output boundaries → dependency config) and explicitly list every skipped file in the report.
  **Why:** Silent skips make the audit's coverage claims unverifiable — a clean report on an incomplete scan reads as a false all-clear.
