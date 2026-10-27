# CONTEXT.md Template

```markdown
# [Project/Directory Name]

## Overview

[One paragraph: what this codebase/directory is and its primary purpose.]

## Language

- **[Term]**: [Definition in this project's context]. _Avoid_: "[synonym1]", "[synonym2]"
- **[Term]**: [Definition]. _Avoid_: "[synonym]"

### Relationships

- [Entity A] contains many [Entity B]
- [Entity B] belongs to exactly one [Entity A]

## Architecture

[System boundaries, data flow, key abstractions. Keep to 3-5 sentences or use ASCII diagram.]

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `src/` | [What it contains and why it's separate] |
| `config/` | [Purpose] |

## Key Patterns

- [Pattern name]: [How it works HERE, not general best practice]
- [Pattern name]: [Specifics]

## Known Gaps

- [Thing that will confuse someone without warning]
- [Tech debt marker or legacy naming issue]

## Children

- [When/Before doing X], read [`src/CONTEXT.md`](src/CONTEXT.md) — [one-line summary]
- [When/Before doing Y], read [`infra/CONTEXT.md`](infra/CONTEXT.md) — [one-line summary]
```
