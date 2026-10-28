# Agents Taxonomy

Multi-platform reference for agent definitions. Loaded in Phase 3 when artifact type is **Agent** and during ai-forge-update platform detection.

## Contents

- [Platform Detection](#platform-detection)
- [Claude Code](#claude-code)
- [GitHub Copilot](#github-copilot)
- [OpenAI Codex](#openai-codex)
- [Google Gemini](#google-gemini)

---

## Platform Detection

Identify platform from file path and extension before drafting:

| Path pattern | Extension | Platform |
|---|---|---|
| `.claude/agents/` or `~/.claude/agents/` | `.md` | Claude Code — agent |
| `.claude/skills/*/` or `~/.claude/skills/*/` | `SKILL.md` (exact) | Claude Code — skill |
| `.github/agents/` | `.agent.md` | GitHub Copilot — agent |
| `.github/skills/*/` | `SKILL.md` (exact) | GitHub Copilot — skill |
| `.codex/agents/` or `~/.codex/agents/` | `.toml` | OpenAI Codex — agent |
| `.codex/skills/*/` or `~/.codex/skills/*/` | `SKILL.md` (exact) | OpenAI Codex — skill |
| `.gemini/agents/` or `~/.gemini/agents/` | `.md` | Google Gemini — subagent |
| `.gemini/skills/*/` or `~/.gemini/skills/*/` | `SKILL.md` (exact) | Google Gemini — skill |

`.agents/` and `.skills/` are cross-tool aliases for `.gemini/` equivalents (takes precedence within the same tier).

---

## Claude Code

**File:** `.claude/agents/<name>.md` (project) · `~/.claude/agents/<name>.md` (user)
**Subdirs:** scanned recursively; identity comes from `name` frontmatter, not path
**Plugin agents:** `<plugin>/agents/<name>.md` — `hooks`, `mcpServers`, `permissionMode` fields are ignored

### Frontmatter

```yaml
---
name: agent-name             # REQUIRED. Lowercase + hyphens.
description: "..."           # REQUIRED. Claude uses this for delegation.
tools: Read, Grep, Glob      # Optional. Allowlist. Omit = inherits all.
disallowedTools: Write, Edit # Optional. Denylist. Applied before tools allowlist.
model: sonnet                # Optional. See aliases below.
permissionMode: default      # Optional. default|acceptEdits|auto|dontAsk|bypassPermissions|plan
maxTurns: 20                 # Optional. Max agentic turns.
skills:                      # Optional. Skill names to preload into context.
  - api-conventions
mcpServers:                  # Optional. Inline defs or string refs.
  - my-server:
      type: stdio
      command: npx
      args: ["-y", "@my/mcp"]
hooks:                       # Optional. Same format as settings.json hooks.
  PreToolUse:
    - matcher: "Bash"
      hooks: [{ type: command, command: "./validate.sh" }]
memory: user                 # Optional. user|project|local
background: false            # Optional.
effort: medium               # Optional. low|medium|high|xhigh|max
isolation: worktree          # Optional. Runs in isolated git worktree.
color: blue                  # Optional. red|blue|green|yellow|purple|orange|pink|cyan
initialPrompt: "..."         # Optional. Auto-submitted when agent runs as main session only.
---
```

### Model aliases

| Alias | Resolves to |
|---|---|
| `sonnet` | Current Sonnet (default for most tasks) |
| `opus` | Current Opus (complex reasoning) |
| `haiku` | Current Haiku (routing, classification) |
| `fable` | Fable model |
| `inherit` | Same as main conversation (default when omitted) |

Full model IDs also accepted: `claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`.

### Tool access

- Both `tools` and `disallowedTools` can be set: denylist applied first, then allowlist
- MCP patterns: `mcp__<server>`, `mcp__<server>__*`; `mcp__*` in disallowedTools removes all MCP
- Restrict subagent spawning: `tools: Agent(worker, researcher), Read` — parens = allowlist of spawnable types
- Omit `Agent` from tools entirely to prevent spawning any subagents

### Invocation

- **Auto:** Claude delegates based on `description` match
- **@-mention:** `@agent-<name>` — user routes one task explicitly
- **Session-wide:** `claude --agent <name>` or `settings.json: { "agent": "<name>" }`
- **Fork:** `/fork <task>` — inherits full conversation history

### Key constraints

- **Blocked in subagents:** `AskUserQuestion`, `EnterPlanMode`, `ExitPlanMode`, `ScheduleWakeup`, `WaitForMcpServers`
- **Max nesting depth:** 5 levels; fixed, not configurable
- **File changes require session restart** — except edits via `/agents` UI
- `name` must be unique within scope; silent discard on collision
- Subagents do NOT see parent conversation history (forks are the exception)
- `hooks`, `mcpServers`, `permissionMode` ignored for plugin agents

---

## GitHub Copilot

**File:** `.github/agents/<name>.agent.md` (repo) · `agents/<name>.agent.md` (org's `.github`/`.github-private` repo)
**Must be on default branch** to be active; page refresh required after commit
**Max body:** 30,000 characters

### Frontmatter

```yaml
---
name: test-specialist        # Optional. Display name. Defaults to filename without suffix.
description: "..."           # REQUIRED. Shown during agent selection.
tools: ["read", "search"]    # Optional. Allowlist. Omit = all available tools.
mcp-servers:                 # Optional. Agent-scoped MCP config.
  my-server:
    type: stdio              # stdio|http|sse|local
    command: npx
    args: ["-y", "my-mcp"]
    tools: ["*"]             # or specific tool list
    env:
      API_KEY: $COPILOT_MCP_API_KEY   # secrets must be prefixed COPILOT_MCP_
model: "..."                 # Optional. Honoured in IDEs only; ignored on GitHub.com.
target: github-copilot       # Optional. vscode|github-copilot. Omit = both.
---
```

### Invocation

- **Web UI:** dropdown at `github.com/copilot`
- **Issue assignment:** assign issue to Copilot → select agent from dropdown
- **IDEs (VS Code, JetBrains, Eclipse, Xcode):** agent picker

### Key constraints

- **No sub-agent spawning** — single-agent per task; no coordinator/worker delegation
- **`model` ignored on GitHub.com** — IDE-only; valid model IDs not publicly enumerated
- **MCP:** tools only (no resources or prompts); no OAuth-authenticated remote servers; invoked autonomously without per-use approval
- **Secret refs:** `$VAR`, `${VAR}`, `${VAR:-default}`; secrets must carry `COPILOT_MCP_` prefix
- Custom instruction files (`.github/instructions/*.instructions.md`) are a separate system with their own `applyTo:` glob frontmatter — not agent files

---

## OpenAI Codex

**Format: TOML — not YAML frontmatter + markdown**
**File:** `.codex/agents/<name>.toml` (project) · `~/.codex/agents/<name>.toml` (user)
**Instruction files (separate system):** `AGENTS.md`, `AGENTS.override.md` — pure markdown, no frontmatter

### Agent definition (TOML)

```toml
name = "security-auditor"              # REQUIRED
description = "..."                    # REQUIRED. Routing guidance for Codex.
developer_instructions = """           # REQUIRED. The agent's system prompt.
You are a security expert...
"""

nickname_candidates = ["Atlas", "Echo"]  # Optional. Display names for spawned instances.
model = "gpt-5.5"                        # Optional. Inherits from parent if omitted.
model_reasoning_effort = "medium"        # Optional. minimal|low|medium|high|xhigh
sandbox_mode = "workspace-write"         # Optional. read-only|workspace-write|danger-full-access
```

### Model IDs

| ID | Use for |
|---|---|
| `gpt-5.5` | Complex planning, multi-step tasks |
| `gpt-5.4` | Strong coding and reasoning |
| `gpt-5.4-mini` | Exploration, read-heavy scans |

### Invocation

- **Explicit only** — Codex does NOT auto-spawn subagents; user must instruct explicitly
- **Parallel pattern example:** "Spawn two agents: research X in one and Y in the other"
- **`/agent` slash command:** switch between active agent threads

### Key constraints

- **TOML format** — `developer_instructions` is the body equivalent (not a markdown body after `---`)
- **AGENTS.md ≠ agent definition** — it's ambient context loaded into every session, not an agent file
- **Subagents inherit parent sandbox** — no per-subagent sandbox escalation
- **Protected dirs (always read-only):** `.git`, `.agents`, `.codex`
- **Project config trust gate:** `.codex/config.toml` only loaded for trusted projects
- **Depth & concurrency:** `agents.max_depth` (default `1`), `agents.max_threads` (default `6`)
- **Name collision:** custom agent named `default`, `worker`, or `explorer` replaces that built-in

### AGENTS.md (context file, not an agent definition)

- Lives at project root or `~/.codex/AGENTS.md`; pure markdown, no frontmatter
- Max combined size: 32 KiB; closer-to-CWD files take precedence

---

## Google Gemini

Two distinct systems — Subagents (isolated executors) and Skills (consent-gated context injection).

### Subagents

**File:** `.gemini/agents/<name>.md` (project) · `~/.gemini/agents/<name>.md` (user)
**Alias:** `.agents/agents/<name>.md` (cross-tool interop; takes precedence within same tier)

```yaml
---
name: security-auditor          # REQUIRED. Unique slug; becomes the @-mention handle.
description: "..."              # REQUIRED. Used for auto-delegation and @-mention discovery.
kind: local                     # Optional. local|remote. Default: local.
tools:                          # Optional. Inherits all if omitted.
  - read_file
  - grep_search
  - "mcp_*"                     # all MCP tools
  - "mcp_my-server_*"           # specific MCP server
mcpServers:                     # Optional. Inline MCP server config isolated to this agent.
  my-server:
    command: 'node'
    args: ['path/to/server.js']
model: gemini-3-flash-preview   # Optional. Inherits parent session model if omitted.
temperature: 0.2                # Optional. 0.0–2.0. Default: 1.
max_turns: 10                   # Optional. Default: 30.
timeout_mins: 5                 # Optional. Default: 10.
---
```

### Gemini Skills (different from Subagents)

**File:** exactly `SKILL.md` in `.gemini/skills/<name>/` (project) · `~/.gemini/skills/<name>/` (user)
**Frontmatter:** only `name` and `description` — no tool/model fields

```yaml
---
name: code-reviewer
description: "Use when reviewing code changes or PRs. Triggers are 'review', 'PR review'."
---
```

Skill body = core procedural instructions. Detailed material goes in `references/` subdir, loaded on demand.

### Invocation

- **Subagent auto-delegation:** main agent routes to subagent when task matches `description`
- **Subagent @-mention:** `@security-auditor find SQL injection risks` — bypasses main agent decision
- **Skill auto-activation:** model calls `activate_skill` when task matches; user sees consent dialog first
- **Skill slash commands:** `/skills list`, `/skills disable <name>`, `/skills enable <name>`, `/skills reload`

### Model IDs

| ID | Use for |
|---|---|
| `gemini-3-flash-preview` | Speed, read-heavy exploration |
| `gemini-3-preview` | Complex reasoning tasks |
| `gemini-2.5-computer-use-preview-10-2025` | Visual browser automation |

### Key constraints

- **Subagents cannot spawn subagents** — enforced at runtime; wildcards in `tools` do not override this
- **Remote agents:** `kind: remote` enables Agent-to-Agent (A2A) protocol
- **Skill name must match directory name** — mismatch is undefined behavior
- **GEMINI.md:** ambient context file (configurable; can also accept `AGENTS.md`, `CONTEXT.md` via settings); no frontmatter; supports `@./path.md` imports
- **Disable all subagents:** `settings.json: { "experimental": { "enableAgents": false } }`
- **Per-agent override:** `settings.json: { "agents": { "overrides": { "<name>": { "enabled": false } } } }`
