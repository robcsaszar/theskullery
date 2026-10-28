# Security Audit Checklist

62 categories across 8 groups. Work through every item. Mark PASS / FAIL / MANUAL-REVIEW for each.

---

## Group A — Injection

| # | Category | What to check |
|---|----------|---------------|
| A1 | SQL injection | All DB queries use parameterized placeholders — no string concatenation into SQL |
| A2 | NoSQL injection | If using MongoDB/Redis, operators like `$where` or `$regex` not reachable from user input |
| A3 | Command injection | No `exec`, `spawn`, `child_process` calls with user-controlled strings; no template interpolation in shell commands |
| A4 | Server-side template injection | No template engine evaluating user input as code (Handlebars `{{{...}}}`, Jinja `{% ... %}`, etc.) |
| A5 | Log injection / CRLF | User input written to logs is not raw — newline characters would let attacker inject fake log lines |
| A6 | XML / XXE | If parsing XML, external entity expansion disabled; `DOCTYPE` declarations rejected |
| A7 | LDAP injection | If querying LDAP, user input is escaped before use in filter strings |
| A8 | HTTP parameter pollution | Multiple values for the same parameter name handled predictably; no business logic relying on first-wins or last-wins ambiguity |

---

## Group B — Client-Side

| # | Category | What to check |
|---|----------|---------------|
| B1 | Reflected XSS | User input rendered in HTML is escaped; no `innerHTML`, `dangerouslySetInnerHTML`, or `{@html}` on unsanitized input |
| B2 | Stored XSS | User-supplied content stored in DB and later rendered is sanitised server-side before storage or escaped on render |
| B3 | DOM XSS | No `document.write`, `eval`, `setTimeout(string)`, or `location.hash` inserted into DOM without sanitisation |
| B4 | Content Security Policy | CSP header present; `script-src` does not contain `'unsafe-inline'` (or uses nonces); `frame-ancestors` set |
| B5 | Subresource integrity | External scripts/styles loaded from CDNs carry `integrity` + `crossorigin` attributes |
| B6 | Open redirect | No `redirect()` or `Location` header constructed from user-supplied `?next=` or similar without allowlist |
| B7 | Clickjacking | `X-Frame-Options: DENY` or `frame-ancestors: 'none'` in CSP |
| B8 | Tabnabbing | `<a target="_blank">` links include `rel="noopener noreferrer"` |
| B9 | postMessage security | Any `window.addEventListener('message', ...)` handler validates `event.origin` before acting |
| B10 | Sensitive data in bundles | Client-side JS bundle does not embed server secrets; Vite/webpack env var handling reviewed; source maps not served in production |
| B11 | localStorage abuse | Session tokens and secrets not stored in `localStorage` or `sessionStorage` (XSS-accessible); only non-sensitive preferences stored there |

---

## Group C — Auth & Session

| # | Category | What to check |
|---|----------|---------------|
| C1 | Cookie attributes | Auth cookies: `HttpOnly`, `Secure` (production), `SameSite=Lax` or `Strict`; no auth value in non-HttpOnly cookie |
| C2 | Token expiry | Tokens have a bounded `exp` / `maxAge`; checked on every request |
| C3 | Session revocation | Logout invalidates the token server-side (not just client-side cookie deletion); token blacklist or `logged_out_at` timestamp |
| C4 | Account enumeration | Login and password-reset responses are identical regardless of whether the email exists; timing is equalised with a dummy hash |
| C5 | Password hashing | Passwords stored with bcrypt / scrypt / argon2, or PBKDF2-HMAC-SHA256 where the runtime forces it; no MD5, SHA-1, or plain SHA-256; parameters meet current OWASP minimums, subject to the platform ceiling below |
| C6 | Password policy | Minimum length enforced (≥8 chars); maximum length enforced to prevent DoS (≤1000 chars) |
| C7 | Password reset flow | Tokens are cryptographically random (≥128 bits); hashed before storage; single-use enforced atomically; expire in ≤1 hour |
| C8 | Brute-force protection | Login, signup, and password-reset endpoints rate-limited per IP; lockout or throttle after N failures |
| C9 | Multi-factor authentication | If supported: second factor verified server-side; backup codes handled securely |
| C10 | Session fixation | New session token issued on privilege change (login, role grant); old token invalidated |
| C11 | JWT / token weaknesses | If JWT: algorithm explicitly set and not `none`; `alg` header not trusted from the token itself; HS256 secret is long and random |
| C12 | OAuth / SSO misconfig | If using OAuth: `state` parameter used and validated; `redirect_uri` strictly allowlisted; `code` exchanged server-side |

### C5 platform ceiling — PBKDF2 on Cloudflare Workers and Pages

**Apply only when Phase 1 identified the deploy target as Cloudflare Workers or Pages.** On any other runtime, hold C5 to the OWASP figure and ignore this note.

OWASP recommends 210,000 PBKDF2-HMAC-SHA256 iterations. As of 2026-08-15, Cloudflare's Web Crypto implementation caps client-supplied `iterations` at **100,000** on Workers and Pages, and the cap is not configurable. Code asking for 210,000 does not silently downgrade — it fails — so a repo on this platform will legitimately show 100,000.

Before writing this up, **check whether the cap still stands** — it is a vendor limit that can change, and this note is only as fresh as its date. If you cannot check, say the figure is unverified as of the date above rather than asserting it.

Verdicts:

- 100,000 iterations on Cloudflare, cap still in force → **PASS**, with a one-line note that the platform ceiling, not the application, sets the figure. Do not file a FAIL whose only remedy is leaving the platform.
- Below 100,000 on Cloudflare → **FAIL**. The ceiling explains 100,000, not 40,000; raise it to the cap.
- 100,000 on Cloudflare, cap since lifted → **FAIL**, and the fix is now simply the higher iteration count.
- Cloudflare, and the codebase could reasonably run argon2id via WASM instead → **MANUAL-REVIEW**, since that is an architecture decision rather than a one-line fix.

Where the ceiling binds, check that the compensating controls are actually present — C8 brute-force protection on the login path, and a password policy (C6) that does not lean on the hash to carry weak passwords. A capped work factor with no rate limiting is the finding worth writing.

---

## Group D — Transport

| # | Category | What to check |
|---|----------|---------------|
| D1 | HTTPS / HSTS | `Strict-Transport-Security` with `max-age ≥ 31536000`; deploy platform enforces HTTPS redirects |
| D2 | CORS | No `Access-Control-Allow-Origin: *` on authenticated endpoints; allowed origins are an explicit allowlist |
| D3 | CSRF | State-mutating requests protected by `SameSite` cookie + origin/referer check, or CSRF token; form actions covered |
| D4 | Security headers | `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` set; no unnecessary headers exposing server version |
| D5 | Host header injection | No redirect, email link, or password-reset URL constructed from the `Host` header without validation against an allowlist |
| D6 | HTTP request smuggling | If behind a reverse proxy, `Content-Length` and `Transfer-Encoding` handling is consistent; proxy strips or normalises ambiguous headers |
| D7 | Cache poisoning | Cache keys include all security-relevant headers; `Vary` headers correct; CDN does not cache Set-Cookie responses |
| D8 | WebSocket security | If used: WS origin validated on handshake; authentication token checked before accepting connection |

---

## Group E — Input / Output

| # | Category | What to check |
|---|----------|---------------|
| E1 | Input validation | All user-supplied input validated against a schema (type, length, pattern) before use; schema is server-side, not just client-side |
| E2 | File upload security | Allowed MIME types explicitly listed; content inspected (not just extension); size limit enforced; files stored outside web root or in object storage with no execution permission; filenames sanitised |
| E3 | Path traversal | No file read/write using user-supplied paths; if paths are dynamic, constrained to an allowlist or resolved and checked against a safe root |
| E4 | ReDoS | No regular expressions with nested quantifiers or catastrophic backtracking on user-controlled input |
| E5 | Mass assignment | Update endpoints extract only named fields from validated schema; no spread of raw request body into DB update |
| E6 | IDOR | Resource lookups by ID include ownership check (`WHERE id = ? AND owner_id = ?`); admin endpoints separate from user endpoints |
| E7 | Excessive data exposure | API responses return only fields the client needs; no `SELECT *` where sensitive columns (password_hash, internal flags) could leak |
| E8 | Pagination limits | List endpoints enforce a maximum page size; no endpoint returns unbounded results |
| E9 | SSRF | Server-side HTTP calls do not use user-supplied URLs; if they must, URL is validated against a protocol+hostname allowlist before the request is made |

---

## Group F — Cryptography

| # | Category | What to check |
|---|----------|---------------|
| F1 | Algorithm choices | No MD5, SHA-1, DES, RC4, or ECB mode in any security-relevant operation |
| F2 | Insecure randomness | `Math.random()` not used for tokens, IDs, or nonces; `crypto.randomBytes` or `crypto.getRandomValues` used instead |
| F3 | Key / secret storage | Secrets not hardcoded; loaded from env vars; not logged; not committed to VCS (check `.env.example` for real values) |
| F4 | Timing attacks | Comparison of secrets (tokens, hashes) uses `timingSafeEqual` or equivalent; no early-return on first mismatched byte |
| F5 | Token scope | API tokens for third-party services (DB, email, storage) are least-privilege; separate tokens per environment (dev ≠ prod) |
| F6 | Webhook HMAC | Inbound webhooks validated with HMAC signature from the provider; raw body used for HMAC, not parsed body |

---

## Group G — Supply Chain

| # | Category | What to check |
|---|----------|---------------|
| G1 | Dependency CVEs | `npm audit` / `pnpm audit` run; critical and high CVEs resolved or have documented accepted risk; `overrides` used for transitive CVEs |
| G2 | Lockfile integrity | `package-lock.json` / `pnpm-lock.yaml` committed and up to date; `--frozen-lockfile` used in CI |
| G3 | Git-pinned dependencies | Any `github:org/repo#branch` dep is pinned to a commit SHA, not a mutable branch ref |
| G4 | Typosquatting | Package names in `package.json` checked against known typosquats of popular packages |
| G5 | Secrets in history | `git log` and `.env*` files checked for accidentally committed secrets; `.gitignore` covers `.env` variants |
| G6 | Build-time secret exposure | CI environment does not print secrets; build artifacts do not embed secrets |

---

## Group H — Ops & Observability

| # | Category | What to check |
|---|----------|---------------|
| H1 | Error disclosure | Production error responses return generic messages; stack traces, file paths, and internal detail not sent to clients |
| H2 | Sensitive data in logs | Passwords, tokens, and PII not logged; error objects logged by field selection, not as a raw dump |
| H3 | Audit logging | Security-relevant events logged (login, logout, signup, password change, account deletion, role change, privilege use) with timestamp, user ID, and IP |
| H4 | Rate limiting | All authentication and account-action endpoints rate-limited per IP; rate limiter key cannot be forged (trusted IP header, not raw XFF) |
| H5 | Admin endpoint protection | Admin routes guarded at both the router/middleware level and per-handler level (defence in depth) |
| H6 | Debug endpoints | No debug routes (`/debug`, `/__inspect`, `/graphql` introspection) exposed in production |
| H7 | Default credentials | No framework or library default passwords left active; test accounts removed or gated behind env vars |
| H8 | Security.txt | `/.well-known/security.txt` present with a contact address for responsible disclosure |
| H9 | Dependency update policy | Process exists for reviewing and applying security patches; automated alerts (Dependabot / Renovate) enabled |
| H10 | Backup and recovery | Database backups enabled and tested; point-in-time recovery available; backup access is restricted |
