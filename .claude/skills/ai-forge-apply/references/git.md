# Git branch decision

Loaded only when the user answered `(c)ommit when done`. One question per turn.

- If already on an `ai/*` branch, check **relevance** (does the branch name relate to the skill/agent being modified?):

  ```text
  On branch ai/<name>. Relevant to this change? (y)es — commit here / (n)ew branch / (Q)uit?
  ```

  On `y`: use current branch.
  On `n`: create `ai/<skill-or-agent-name>-<two-word-description>` from current HEAD.

- If on any other branch:

  ```text
  Create ai/<suggested-name> branch? (y)es / (n)o — abort git mode
  ```

**NEVER commit or push on a non-`ai/*` branch** unless the repo's own convention says AI work lands on the default branch (an `AGENTS.md`/`CLAUDE.md` line, or a history of skill commits on `main`) — then commit there and skip the branch questions. Without that convention, AI-related changes go on a dedicated `ai/*` branch so work branches stay clean.

