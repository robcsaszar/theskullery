# CONTEXT.md Knowledge Base

## What CONTEXT.md Is

A **briefing document** for AI agents and human developers that describes what a codebase IS — its architecture, domain model, conventions, and relationships. Unlike README (which introduces to outsiders) or AGENTS.md (which controls behavior), CONTEXT.md provides the factual substrate an agent needs to reason correctly about code.

## Core Principles

### Hierarchical Locality

- Place CONTEXT.md files throughout the directory tree, each describing its own scope
- Agents walk UP from their working file to gather layered context (specific → general)
- Root CONTEXT.md = broad architecture; nested = focused domain detail
- Never duplicate content from child CONTEXT.md in a parent — link instead

### LLM-Optimized

- Write for token efficiency: facts, not prose
- Frontload the highest-value information (architecture, domain terms)
- Use structured formats: tables, definition lists, relationship maps
- Keep each file under 200 lines — if longer, split into children

### Human-Reviewable

- Must make sense to a developer reading it cold
- Update in the same PR that changes architecture
- Can be AI-drafted, then human-reviewed (common bootstrap pattern)

## Separation of Concerns

| File | Purpose | Content |
|------|---------|---------|
| CONTEXT.md | What the codebase IS | Architecture, domain model, patterns, relationships |
| AGENTS.md | How agents should BEHAVE | Commands, rules, boundaries, tool constraints |
| README.md | Introduction for humans | Setup, quickstart, contributing guide |
| copilot-instructions.md | Global agent personality | Tone, style, capability constraints |

**Key rule:** If content tells the agent what to DO → AGENTS.md. If it tells the agent what EXISTS → CONTEXT.md.

## High-Value Sections (priority order)

1. **Language / Domain Model** — Term definitions with preferred names, "Avoid" alternatives, and relationships. This is the highest-ROI section: eliminates misnamed variables, wrong abstractions, confused entity relationships.

2. **Architecture Overview** — System boundaries, data flow direction, key abstractions. One paragraph + a diagram reference or ASCII art.

3. **Key Patterns & Conventions** — How things are done HERE (not general best practices). E.g., "All DB queries go through `packages/core/db.ts` — never import the DB client directly in route handlers."

4. **File/Directory Purpose Map** — What each top-level directory contains and WHY it's separate.

5. **Known Gaps & Gotchas** — Things that will confuse an agent without warning. Tech debt markers, legacy naming, inconsistencies.

6. **Child Links** — Pointers to nested CONTEXT.md files for deeper exploration.

## The Language Section

The most distinctive and high-value pattern for CONTEXT.md files:

```markdown
## Language

- **Tenant**: An organization with isolated data. _Avoid_: "customer", "client", "account"
- **Order**: A confirmed purchase (not a cart or quote). _Avoid_: "transaction", "purchase"
- **Job**: A unit of async background work. _Avoid_: "task", "worker", "event"
```

Structure per term:

- **Bold term** — the canonical name
- Description — what it means in THIS project
- _Avoid_ — synonyms that cause confusion (agents will avoid these in generated code/docs)

Add a **Relationships** subsection:

```markdown
### Relationships
- A Tenant owns many Orders; Orders are never shared across Tenants
- An Order has at most one active Fulfillment
- A Job references an Order by ID but is processed independently
```

## Language as Leading Words

Each Language term is a **leading word**: one short token the agent thinks with, repeated verbatim wherever the concept appears — in CONTEXT.md, in code, in AGENTS.md. Repeated as the same token and never re-explained as a sentence, it accumulates a shared meaning and anchors behaviour in the fewest tokens. The _Avoid_ list is the retirement notice for the synonyms.

Two consequences:

- **Prefer the word the code already uses.** A term coined for the doc recruits no prior knowledge and costs a definition line; a term lifted from the codebase is free.
- **Keep the term's caveats beside it.** A term's exceptions or relationships living three sections away is a scattered concept: the agent reads the definition without its neighbours. Definition, Avoid list, and Relationships sit under one heading.

## The Environment Is a Source of Truth

`package.json` scripts, config files, the directory layout, `--help` output — the agent can read all of these directly. A CONTEXT.md line that restates them is a **cache**: a copy of a lookup, worth its cost only when the lookup is expensive, and it goes stale the moment the source moves.

Cache what the agent cannot find by looking: the unwritten convention, the reason a boundary sits where it does, the gotcha no config confesses. Leave the one-command lookups to the environment. A Directory Structure row that says only what `ls` shows fails this test; a row that says *why* the directory is separate passes.

## Child Links Are Pointers

A child link is a **pointer**: a line that names out-of-file material and encodes the condition for reaching it. Its wording, not its target, decides whether the agent ever opens the child. A bare path is read and never acted on.

Write the situation first and the path second, and keep only genuinely distinct triggers — two phrasings of one situation are one pointer written twice.

| Weak pointer | Strong pointer |
|---|---|
| `packages/jobs/CONTEXT.md — queue internals` | `Before touching queue code, read packages/jobs/CONTEXT.md` |
| `See apps/api/CONTEXT.md` | `When adding or changing a route, read apps/api/CONTEXT.md` |
| `More detail in the package READMEs` | (delete — no trigger, no single target) |


## Hierarchical Structure Example

```text
my-platform/
├── CONTEXT.md              # Top-level architecture, domain model, child links
├── packages/
│   ├── core/
│   │   └── CONTEXT.md      # Domain types, DB client, service layer
│   ├── jobs/
│   │   └── CONTEXT.md      # Queue names, job payload shapes, enqueue patterns
│   └── shared/
│       └── CONTEXT.md      # Pure utilities, money arithmetic, validation
└── apps/
    ├── api/
    │   └── CONTEXT.md      # HTTP layer, routing, middleware, context creation
    └── worker/
        └── CONTEXT.md      # Job consumers, retry logic, queue config
```

Each child describes ONLY its own scope. Parent links to children but doesn't repeat their content.

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| README-as-CONTEXT | Setup instructions aren't architecture context | Move setup to README; keep CONTEXT for structural facts |
| Flat dump | Single root file with everything → too long, no locality | Split into per-directory CONTEXT.md files |
| Tutorial style | "First you do X, then Y..." is agent-instruction, not context | State facts: "X calls Y via Z" |
| Stale content | Describes architecture from 6 months ago | Update in same PR as architectural changes |
| Duplicating child content | Root repeats what nested CONTEXT.md says | Link to children instead |
| Mixing concerns | Agent behavior rules inside CONTEXT.md | Move rules to AGENTS.md; keep CONTEXT factual |
| API documentation | Full endpoint docs, param types | Belongs in OpenAPI/JSDoc — CONTEXT just names the surface |
| Bare child pointer | Path with no trigger — the agent reads the line and never opens the file | Lead with the situation: `Before touching queue code, read packages/jobs/CONTEXT.md` |
| Cache of a cheap lookup | Restates what `ls` or a config already shows; goes stale, adds nothing | Keep the why; delete what the environment already answers |

## When to Create CONTEXT.md

- Monorepo with multiple packages or domains
- Onboarding takes >30 min of "where is X?" questions
- Agents repeatedly misname domain terms or confuse entity relationships
- Multiple teams work in different parts of the repo
- Configuration system has non-obvious merge rules or hierarchies

## When NOT to Create CONTEXT.md

- Tiny repos with <5 files (README suffices)
- Generated/vendored code (no humans or agents should reason about internals)
- The content would duplicate what's already in well-maintained AGENTS.md
