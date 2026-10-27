# CONTEXT.md Examples

## Create Mode Output — Generic SaaS API Monorepo

```markdown
# order-platform

## Overview

Multi-tenant order management platform. TypeScript monorepo using npm workspaces. Exposes a REST API (Express) and a background job runner (BullMQ). Tenants are isolated at the database level via schema-per-tenant Postgres.

## Language

- **Tenant**: An organization with its own isolated data schema. _Avoid_: "customer", "client", "account"
- **Order**: A confirmed purchase with line items, not a cart or quote. _Avoid_: "transaction", "purchase", "request"
- **Fulfillment**: The process of picking, packing, and shipping an Order. _Avoid_: "delivery", "shipping" (too narrow)
- **Job**: A unit of async background work processed by BullMQ. _Avoid_: "task", "worker", "event"
- **Context**: The per-request object carrying tenant ID, user, and auth claims — passed explicitly, never global. _Avoid_: "session", "request object"

### Relationships

- A Tenant owns many Orders; Orders are never shared across Tenants
- A Fulfillment belongs to exactly one Order; an Order has at most one active Fulfillment
- A Job references an Order by ID but is processed independently — no live object reference
- Context is created at the HTTP boundary and threaded through all service calls

## Architecture

```

apps/api/ → Express HTTP layer: routes, middleware, context creation
apps/worker/ → BullMQ job runner: queue consumers, retry logic
packages/core/ → Shared domain types, service interfaces, DB client
packages/jobs/ → Job definitions and enqueue helpers (shared by api + worker)

```text

HTTP requests enter `apps/api`, create a Context, call services in `packages/core`, and enqueue Jobs via `packages/jobs`. Workers in `apps/worker` consume those jobs and call the same `packages/core` services — no direct DB access outside `packages/core`.

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `apps/api/` | Express app — routes, auth middleware, request validation |
| `apps/worker/` | BullMQ consumer processes — one file per job type |
| `packages/core/` | DB client, domain services, shared types (`Order`, `Tenant`, etc.) |
| `packages/jobs/` | Queue definitions and typed `enqueue()` helpers |
| `packages/shared/` | Pure utilities: date helpers, money arithmetic, validation schemas |

## Key Patterns

- **Schema-per-tenant DB**: All queries go through `packages/core/db.ts` which sets `search_path` to the tenant schema. Never construct schema names in callers.
- **Explicit Context threading**: Every service function takes `ctx: Context` as first argument — never read from a global or closure.
- **Money as integers**: All monetary values stored and passed as integer cents. `packages/shared/money.ts` handles formatting.
- **Job idempotency**: Every job handler checks for prior completion before executing — jobs may be retried after partial failure.

## Known Gaps

- `Tenant.settings` is a `jsonb` blob with no enforced schema — runtime validation lives in `packages/core/tenant-settings.ts`
- The `apps/worker` retry config is hardcoded in `apps/worker/queue.ts`; per-job overrides aren't wired up yet
- `packages/shared/money.ts` has no support for non-USD currencies — callers assume USD

## Children

- Before touching the DB client or service layer, read [`packages/core/CONTEXT.md`](packages/core/CONTEXT.md) — domain type definitions live there
- Before enqueueing or consuming a Job, read [`packages/jobs/CONTEXT.md`](packages/jobs/CONTEXT.md) — queue names, payload shapes, enqueue patterns
```

---

## Review Mode Output — Hypothetical Stale File

```text
## CONTEXT.md Review: packages/core/CONTEXT.md

**Score:** 14/25 (C)
| Dimension | Score | Note |
|-----------|-------|------|
| Domain Model | 4/5 | Good term definitions but missing "Context" object — a core concept |
| Architecture Signal | 2/5 | Lists files but doesn't describe data flow direction |
| Locality | 4/5 | Scoped to packages/core; links to child dirs present |
| Freshness | 1/5 | References `UserRepository` which was removed; `db.connect()` replaced by `db.ts` module |
| Separation | 3/5 | Contains "always run npm run migrate before tests" — that's an agent instruction |

**Anti-patterns found:** Stale references, mixing concerns (agent instruction in architecture doc)

**Improvements:**
1. Remove `UserRepository` references — users are now queried directly via `db.query()` in service files
2. Move "always run migrate before tests" to AGENTS.md — CONTEXT.md should state that migrations exist, not when to run them
3. Add `Context` to the Language section — it's the most-passed type in the codebase and agents frequently misname it
4. Add a data flow line: "Services receive Context at call site; they never construct it — that's the HTTP/worker boundary's responsibility"
```
