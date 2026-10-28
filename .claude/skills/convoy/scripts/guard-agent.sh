#!/usr/bin/env bash
# PreToolUse guard on Agent while a convoy is active: only the pinned roster may be spawned.
# Registered by convoy's SKILL.md frontmatter for the rest of the session.
roster='scout|builder|reviewer|auditor|sweeper|drill|verifier'
raw=$(cat)
tool=$(printf '%s' "$raw" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[ "$tool" = "Agent" ] || exit 0
type=$(printf '%s' "$raw" | sed -n 's/.*"subagent_type"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
if printf '%s' "$type" | grep -qxE "$roster"; then exit 0; fi
echo "convoy: spawn a roster agent - subagent_type must be one of ${roster//|/, } (got '$type'). Their model, effort, and tools are pinned in .claude/agents/." >&2
exit 2
