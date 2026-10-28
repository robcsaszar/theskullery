# AgentSkills.io Specification (bundled reference)

> Source: <https://agentskills.io/specification>
> Last fetched: 2026-05-18
> If you need the latest version, WebFetch the URL above.

---

## Directory structure

A skill is a directory containing, at minimum, a `SKILL.md` file:

```text
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
├── assets/           # Optional: templates, resources
└── ...               # Any additional files or directories
```

## `SKILL.md` format

The `SKILL.md` file must contain YAML frontmatter followed by Markdown content.

### Frontmatter

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | Max 64 characters. Lowercase letters, numbers, and hyphens only. Must not start or end with a hyphen. |
| `description` | Yes | Max 1024 characters. Non-empty. Describes what the skill does and when to use it. |
| `license` | No | License name or reference to a bundled license file. |
| `compatibility` | No | Max 500 characters. Environment requirements. |
| `metadata` | No | Arbitrary key-value mapping for additional metadata. |
| `allowed-tools` | No | Space-separated string of pre-approved tools. (Experimental) |

#### `name` field

- Must be 1-64 characters
- May only contain lowercase alphanumeric characters (`a-z`) and hyphens (`-`)
- Must not start or end with a hyphen (`-`)
- Must not contain consecutive hyphens (`--`)
- Must match the parent directory name

#### `description` field

- Must be 1-1024 characters
- Should describe both what the skill does and when to use it
- Should include specific keywords that help agents identify relevant tasks

#### `compatibility` field

- Must be 1-500 characters if provided
- Should only be included if your skill has specific environment requirements

#### `metadata` field

- A map from string keys to string values
- Clients can use this to store additional properties not defined by the spec

#### `allowed-tools` field

- A space-separated string of tools that are pre-approved to run
- Experimental. Support may vary between agent implementations

### Body content

The Markdown body contains the skill instructions. No format restrictions. Recommended sections:

- Step-by-step instructions
- Examples of inputs and outputs
- Common edge cases

The agent loads the entire file once it activates a skill. Consider splitting longer content into referenced files.

## Optional directories

### `scripts/`

Contains executable code. Scripts should:

- Be self-contained or clearly document dependencies
- Include helpful error messages
- Handle edge cases gracefully

### `references/`

Contains additional documentation loaded on demand:

- Detailed technical reference
- Form templates or structured data formats
- Domain-specific files

Keep individual reference files focused. Smaller files = less context used.

### `assets/`

Contains static resources: templates, images, data files.

## Progressive disclosure

Skills are loaded progressively:

1. **Metadata** (~100 tokens): `name` and `description` loaded at startup for all skills
2. **Instructions** (< 5000 tokens recommended): Full `SKILL.md` body loaded when activated
3. **Resources** (as needed): Files loaded only when required

Keep main `SKILL.md` under 500 lines. Move detailed reference material to separate files.

## File references

Use relative paths from the skill root. Keep file references one level deep from `SKILL.md`.

## Validation

Use `skills-ref validate ./my-skill` to check frontmatter and naming conventions.
