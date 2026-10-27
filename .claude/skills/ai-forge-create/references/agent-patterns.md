# Agent Pattern Selection Guide

Choose the pattern that matches the agent's role in the workflow.

---

## The Five Patterns

| Pattern | Lines | Use When | Key Characteristic |
|---------|-------|----------|-------------------|
| **Pipeline** | ~200 | Part of spec-driven or sequential workflow | Clear input/output contract, file-based handoff, isolated context |
| **Worker** | ~150 | Focused subtask execution (impl, fix, review) | Narrow tool access, single responsibility, subagent-friendly |
| **Coordinator** | ~100 | Orchestrates other agents | Spawns/delegates, collects results, minimal own work |
| **Expert** | ~200 | Domain-specific advisory (a11y, security, perf) | Read-only tools, advisory output, diff-driven |
| **Ops** | ~150 | Automates repetitive operational tasks | Branch/commit/PR workflow, config-focused |

---

## Decision Tree

```text
Does the agent produce code changes directly?
│
├── YES → Does it follow a specification or plan?
│          ├── YES → Pipeline pattern (spec in → code out)
│          └── NO  → Does it have a narrow, repeatable focus?
│                     ├── YES → Worker pattern (focused subtask)
│                     └── NO  → Ops pattern (config/branch/PR workflow)
│
└── NO  → Does it delegate work to other agents?
           ├── YES → Coordinator pattern (orchestrate, don't implement)
           └── NO  → Expert pattern (analyze, advise, don't change)
```

---

## Pattern Signatures

### Pipeline (~200 lines)

- **Input**: A file artifact (spec, PRD, ticket)
- **Output**: Code changes committed to a branch, status updated in the input file
- **Tools**: Full edit access, file read/write, git
- **Model**: Balanced (Sonnet) for implementation; Powerful (Opus) for research/writing
- **Key traits**:
  - Clear "done" criteria derived from input artifact
  - Multi-session support (can resume from where it left off)
  - File-based handoff — receives input from files, not conversation history
  - Presents plan before executing
- **Examples**: writer (ticket → spec), implementer (spec → code), reviewer (code → pass/fail report)

### Worker (~150 lines)

- **Input**: A specific task description (often from a coordinator)
- **Output**: Focused result (fix, analysis, single-file change)
- **Tools**: Minimal — only what the task requires
- **Model**: Fast/cheap (Haiku) for simple tasks; Balanced (Sonnet) for moderate ones
- **Key traits**:
  - Single responsibility — does one thing well
  - Designed to be invoked as a subagent
  - `user-invocable: false` when only used by coordinators
  - Short-lived — completes and returns, no multi-session state
- **Examples**: bug-fixer, linter, test-writer

### Coordinator (~100 lines)

- **Input**: Complex request requiring multiple perspectives or parallel work
- **Output**: Synthesized summary from delegated work
- **Tools**: `agent` tool (to spawn subagents), read-only for own analysis
- **Model**: Powerful (Opus) — needs good judgment for delegation decisions
- **Key traits**:
  - Delegates, doesn't implement
  - Specifies which agents to use via `agents:` frontmatter
  - Collects and synthesizes subagent results
  - Decides sequencing: parallel vs. sequential delegation
  - Handles failures: retries, alternative agents, or reports blockers
- **Examples**: feature-builder (plan → implement → review cycle), PR reviewer (multi-perspective)
- **Best practices from platforms**:
  - VS Code: Use `agents: ['Agent1', 'Agent2']` to restrict which subagents can be invoked
  - Keep coordinator instructions focused on orchestration logic, not domain knowledge
  - Each worker should have appropriate tool restrictions (read-only for reviewers, edit for implementers)

### Expert (~200 lines)

- **Input**: Code diff, file set, or specific question
- **Output**: Advisory report — findings, recommendations, no code changes
- **Tools**: Read-only (read, search, glob). No edit/write access.
- **Model**: Balanced (Sonnet) for domain expertise; Powerful (Opus) for nuanced judgment
- **Key traits**:
  - Read-only — analyzes but never modifies
  - Diff-driven — often triggered by changes to review
  - Structured output format (findings table, severity, recommendations)
  - Deep domain knowledge encoded in instructions
  - `disable-model-invocation: false` — can be used as a subagent by coordinators
- **Examples**: accessibility expert, security auditor, performance reviewer

### Ops (~150 lines)

- **Input**: Ticket or task (often from Jira or similar)
- **Output**: Branch created, config changed, PR opened
- **Tools**: git, gh CLI, file edit, config-specific tools
- **Model**: Fast/cheap (Haiku) or Balanced (Sonnet) — tasks are procedural
- **Key traits**:
  - Follows a repeatable workflow (branch → change → commit → PR)
  - Config-focused — edits settings/JSON, not application code
  - Validates changes against schema or types
  - Creates PR with proper title/description format
  - Often market/brand-specific in scope
- **Examples**: ops-ticket (Jira → branch → config change → PR)

---

## Frontmatter Reference (Claude Code only)

> For GitHub Copilot, OpenAI Codex, or Google Gemini frontmatter schemas, file locations, and platform-specific constraints, see [`agents-taxonomy.md`](agents-taxonomy.md).

```yaml
---
name: agent-name                    # Required. Unique identifier.
description: What it does and when  # Required. Guides agent selection.
model: Claude Sonnet 4.6            # Optional. Model selection.
tools: Read, Grep, Glob             # Optional. Tool allowlist. Comma-separated.
disallowedTools: Write, Edit        # Optional. Denylist; applied before allowlist.
permissionMode: default             # Optional. default|acceptEdits|auto|dontAsk|bypassPermissions|plan
maxTurns: 20                        # Optional. Max agentic turns.
isolation: worktree                 # Optional. Isolated git worktree.
memory: user                        # Optional. user|project|local
effort: medium                      # Optional. low|medium|high|xhigh|max
color: blue                         # Optional. red|blue|green|yellow|purple|orange|pink|cyan
---
```

---

## Model Selection Guide

| Tier | Model | Best for |
|------|-------|----------|
| Fast/cheap | Claude Haiku 4.5 | Routing, classification, simple extraction, high-volume ops |
| Balanced | Claude Sonnet 4.6 | Most coding tasks, analysis, general-purpose work |
| Powerful | Claude Opus 4.6 | Complex reasoning, nuanced judgment, costly-error tasks |

**Rule of thumb**: Match model cost to error cost. If a mistake is cheap to fix, use a cheap model. If a mistake is expensive (wrong architecture, security flaw), use a powerful model.

---

## Common Mismatches

**Using Pipeline for one-shot tasks**: Pipeline agents are designed for multi-step workflows with file-based handoff. For a quick fix or single-file change, use Worker.

**Using Expert when changes are needed**: Expert agents are read-only by design. If the task requires edits, it's a Worker or Pipeline agent that happens to need domain knowledge — encode that knowledge in instructions, not in the pattern choice.

**Using Coordinator with one worker**: If there's only one subagent, you don't need orchestration — just use the worker directly. Coordinators earn their complexity with 2+ parallel or sequential workers.

**Using Ops for application code**: Ops agents handle config, settings, and infrastructure. Application code changes belong in Pipeline or Worker patterns with proper spec/test coverage.
