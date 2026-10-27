# Conversion Guide

Porting an existing **Claude Code** artifact to another platform. This is a cross-cutting operation — not automated. Read this, then transform by hand. For per-platform *authoring* schemas (the source of truth for each field), see [`agents-taxonomy.md`](agents-taxonomy.md).

Source is always Claude Code. Targets: GitHub Copilot, OpenAI Codex, Google Gemini. Cursor and Antigravity are noted but not covered.

## Contents

- [What is deterministic vs judgment](#what-is-deterministic-vs-judgment)
- [Path and location (deterministic)](#path-and-location-deterministic)
- [Skills port cleanly](#skills-port-cleanly)
- [Agent frontmatter disposition (judgment)](#agent-frontmatter-disposition-judgment)
- [Codex category mismatch](#codex-category-mismatch)
- [Invocation syntax](#invocation-syntax)
- [Body adjustments](#body-adjustments)
- [Warnings checklist](#warnings-checklist)
- [Cursor and Antigravity (not covered)](#cursor-and-antigravity-not-covered)

## What is deterministic vs judgment

- **Deterministic** — the file path/location and extension; renaming a field that has an exact target equivalent; stripping a Claude-only field.
- **Judgment (do not guess silently)** — any field whose target *value* has no defined mapping: tool-name lists, model IDs, and the `effort`/`permissionMode` enums. Our taxonomy documents each platform in isolation; it has **no cross-platform value tables**, because these maps are ambiguous or non-bijective. When you hit one, state the assumption you made and flag it for the user.

## Path and location (deterministic)

| Artifact | Claude Code | GitHub Copilot | OpenAI Codex | Google Gemini |
|---|---|---|---|---|
| Skill | `.claude/skills/<n>/SKILL.md` | `.github/skills/<n>/SKILL.md` | `.codex/skills/<n>/SKILL.md` | `.gemini/skills/<n>/SKILL.md` |
| Agent | `.claude/agents/<n>.md` | `.github/agents/<n>.agent.md` | `.codex/agents/<n>.toml` | `.gemini/agents/<n>.md` |

All platforms recognize `SKILL.md` as the canonical skill entry point.

## Skills port cleanly

A `SKILL.md` skill is the easy case. Body markdown carries over; only the frontmatter and internal path references need attention.

- **Copilot / Codex** skills: keep `name` + `description`; these platforms read the standard skill frontmatter.
- **Gemini** skills: keep **only** `name` + `description` — no tool/model fields exist there.
- **Codex skill frontmatter is undocumented** in our taxonomy (only the `.toml` agent and `AGENTS.md` context file are). Treat a Claude→Codex *skill* port as name+description only and flag anything richer for manual verification against current Codex docs.
- `allowed-tools`, `disable-model-invocation`, `metadata` — strip for Gemini; verify per current spec for Copilot/Codex.

## Agent frontmatter disposition (judgment)

Claude agent fields, and what happens per target. **Strip = remove and warn.**

| Claude field | Copilot | Codex (`.toml`) | Gemini |
|---|---|---|---|
| `name` | keep | `name` | keep |
| `description` | keep | `description` | keep |
| `tools` (`Read, Grep, Glob`) | array, lowercase — **judgment** (`Grep`/`Glob`→`search`? many-to-one) | no tools field (`sandbox_mode` governs) — strip, note | snake_case (`read_file`, `grep_search`) — **judgment**, no canonical map |
| `model` (alias) | **judgment** (IDs not enumerated; ignored on github.com) | **judgment** → `gpt-5.x` | **judgment** → `gemini-3-*` |
| `maxTurns` | strip | strip | `max_turns` (clean rename) |
| `permissionMode` | strip | `sandbox_mode` — **judgment**, disjoint enums | strip |
| `effort` | strip | `model_reasoning_effort` — **judgment**, `max` has no Codex image | strip |
| `mcpServers` | `mcp-servers` — secrets need `COPILOT_MCP_` prefix | via config — judgment | `mcpServers` (kept) |
| `disallowedTools`, `skills`, `hooks`, `memory`, `background`, `isolation`, `color`, `initialPrompt` | strip | strip | strip |
| — Codex-only — | | `developer_instructions` (REQUIRED), `nickname_candidates` | — Gemini-only — `kind`, `temperature`, `timeout_mins` |

## Codex category mismatch

A Claude agent → Codex agent is **not a reskin**. Codex agents are TOML, and the markdown **body becomes `developer_instructions`** — a *required* TOML multiline string (the system prompt). So what the plan of "only body wording changes" would treat as prose is actually a mechanical move of the whole body into a structured, escape-sensitive frontmatter field. Also note: Codex `AGENTS.md` is ambient context, **not** an agent definition — do not conflate them.

## Invocation syntax

Update any invocation examples in the body:

| Platform | Skill | Agent |
|---|---|---|
| Claude Code | `/skill-name` | `@agent-<name>` |
| Copilot | description-routed | dropdown / issue assignment |
| Codex | description-routed | `$mention`, explicit spawn only |
| Gemini | `/skills`, auto-activate | `@name`, auto-delegate |

## Body adjustments

- Path references: `.claude/` → the target's root (`.github/`, `.codex/`, `.gemini/`).
- Context-file references: `CLAUDE.md` → `AGENTS.md` (Codex) / `GEMINI.md` (Gemini) / `.github` copilot instructions.
- Features with no target equivalent — subagent spawning, lifecycle `hooks`, forked contexts, `Task`/`Agent` delegation — flag for manual review; most targets cannot express them.

## Warnings checklist

Before handing back a port, surface every one that applies:

- [ ] Model ID guessed (no canonical alias→ID map)
- [ ] Tool names remapped by inference (`Grep`/`Glob`→`search`/`grep_search`)
- [ ] `effort` / `permissionMode` enum had no exact target value
- [ ] Claude-only fields stripped (list them)
- [ ] Codex: body moved into required `developer_instructions`
- [ ] Body features with no target equivalent (hooks, subagents, forks)

## Cursor and Antigravity (not covered)

Documented here only so their differences are known; no port instructions provided.

- **Cursor** — rules at `.cursor/rules/*.mdc` with 3-field frontmatter (`description`, `globs`, `alwaysApply`); if `alwaysApply: true` and `globs` are both set, globs are ignored. Cursor 2.4+ parses `SKILL.md` natively.
- **Antigravity** — skills at `.agent/skills/`; `GEMINI.md` as context; template variables `{{SKILL_PATH}}` / `{{WORKSPACE_PATH}}` replace hardcoded paths.
