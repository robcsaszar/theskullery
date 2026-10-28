#!/usr/bin/env node
/**
 * Validates skill/agent frontmatter metadata, and reports how it ports to another platform.
 *
 * Usage:
 *   node scripts/validate-metadata.cjs --name "<name>" --description "<desc>"
 *                                      [--when-to-use "<text>"]
 *                                      [--target claude|agentskills|copilot|codex|gemini]
 *                                      [--artifact skill|agent]
 *
 * Checks (spec + our own forge rules):
 *   Name  : format, length, reserved prefixes
 *   Desc  : length, single-line, no colons, no angle brackets,
 *           no first/second-person, no dated model IDs, negative trigger present
 *   Combined description + when_to_use against the Claude Code listing cap
 *
 * With --target, also prints a field-disposition report for that platform:
 *   PORTABLE  survives as-is
 *   DROPPED   removed, with the reason
 *   DECIDE    no canonical mapping — a human must choose; never guessed here
 *
 * Exits 0 on pass, 1 on failure (errors to stderr). Zero dependencies.
 */

const args = process.argv.slice(2);

function arg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

const name = arg('--name');
const description = arg('--description') ?? '';
const whenToUse = arg('--when-to-use') ?? '';
const target = arg('--target');
const artifact = arg('--artifact') ?? 'skill';

const TARGETS = ['claude', 'agentskills', 'copilot', 'codex', 'gemini'];

if (!name) {
  process.stderr.write(
    'Usage: node validate-metadata.cjs --name "<name>" [--description "<desc>"]\n'
    + `       [--when-to-use "<text>"] [--target ${TARGETS.join('|')}] [--artifact skill|agent]\n`,
  );
  process.exit(1);
}

if (target && !TARGETS.includes(target)) {
  process.stderr.write(
    `TARGET ERROR: unknown target '${target}' — expected one of: ${TARGETS.join(', ')}.\n`,
  );
  process.exit(1);
}

if (artifact !== 'skill' && artifact !== 'agent') {
  process.stderr.write(
    `ARTIFACT ERROR: unknown artifact '${artifact}' — expected 'skill' or 'agent'.\n`,
  );
  process.exit(1);
}

const errors = [];
const warnings = [];

// ── Name checks ───────────────────────────────────────────────────────────────

// Length
if (name.length < 1 || name.length > 64) {
  errors.push(`NAME ERROR: '${name}' is ${name.length} chars — must be 1–64.`);
}

// Format: lowercase, numbers, single hyphens, no leading/trailing/consecutive
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
  errors.push(
    `NAME ERROR: '${name}' is invalid — lowercase letters, numbers, and single hyphens only; `
    + 'cannot start/end with a hyphen or contain consecutive hyphens.',
  );
}

// Reserved prefixes (our forge rule + spec)
const RESERVED = ['claude', 'anthropic', 'copilot', 'codex', 'gemini'];
const usedReserved = RESERVED.find(p => name.startsWith(`${p}-`) || name === p);
if (usedReserved) {
  errors.push(
    `NAME ERROR: '${name}' starts with reserved prefix '${usedReserved}' — choose a different name.`,
  );
}

// ── Description checks ────────────────────────────────────────────────────────

// Length
if (description.length > 1024) {
  errors.push(
    `DESCRIPTION ERROR: ${description.length} chars — must be 1,024 or fewer.`,
  );
}

// Single-line (no newlines — our forge rule: no YAML multiline)
if (/[\r\n]/.test(description)) {
  errors.push(
    'DESCRIPTION ERROR: multiline value detected — use a single-line string; never use YAML \'|\' or \'>\' block scalars.',
  );
}

// No unescaped colons (our forge rule — breaks frontmatter parsing)
if (description.includes(':')) {
  errors.push(
    'DESCRIPTION ERROR: unescaped colon in description — rephrase as \'—\' or \'(…)\'; '
    + 'colons break YAML frontmatter parsing when the value is unquoted.',
  );
}

// No XML angle brackets (our forge rule — prompt injection risk)
if (/<|>/.test(description) || /<|>/.test(name)) {
  errors.push(
    'FRONTMATTER ERROR: angle brackets (\'<\', \'>\') detected — remove them; '
    + 'frontmatter sits in the system prompt and angle brackets enable prompt injection.',
  );
}

// No first/second-person pronouns (spec + our rule)
const FORBIDDEN_PRONOUNS = ['i', 'me', 'my', 'we', 'our', 'you', 'your'];
const words = new Set(description.toLowerCase().match(/\b\w+\b/g) ?? []);
const found = FORBIDDEN_PRONOUNS.filter(w => words.has(w));
if (found.length > 0) {
  errors.push(
    `STYLE ERROR: description contains first/second-person terms: ${found.join(', ')} — `
    + 'use third-person imperative (e.g. "Creates…", "Analyzes…").',
  );
}

// No dated model IDs anywhere in the metadata (our forge rule — artifacts outlive model releases)
const DATED_MODEL = /\b(?:claude|gpt|gemini)[a-z0-9.-]*-\d{8}\b/i;
const datedIn = [
  ['description', description],
  ['when_to_use', whenToUse],
  ['name', name],
].find(([, v]) => DATED_MODEL.test(v));
if (datedIn) {
  const [field, value] = datedIn;
  errors.push(
    `MODEL ERROR: dated model ID found in ${field} ('${value.match(DATED_MODEL)[0]}') — `
    + 'pin a family alias (sonnet, opus, haiku) or omit; dated IDs rot as models are released.',
  );
}

// Combined description + when_to_use cap (Claude Code truncates the skill listing at 1,536)
const combined = description.length + whenToUse.length;
if (combined > 1536) {
  errors.push(
    `LISTING ERROR: description + when_to_use is ${combined} chars — must be 1,536 or fewer; `
    + 'Claude Code truncates the combined text in the skill listing, silently cutting your triggers.',
  );
}

// Negative trigger advisory (our forge rule — not a hard fail)
if (!/don't use for|do not use for|not for|avoid for/i.test(description)) {
  warnings.push(
    'STYLE ADVISORY: no negative trigger found — consider adding "Don\'t use for [anti-scenario]" '
    + 'to prevent mis-activation on adjacent tasks.',
  );
}

// ── Target disposition ────────────────────────────────────────────────────────
// Mirrors the tables in references/conversion-guide.md. Deterministic rows are applied
// here; ambiguous ones are surfaced as DECIDE rather than guessed.

const CLAUDE_ONLY_REASON = {
  when_to_use: 'Claude Code listing field — no target equivalent',
  'argument-hint': 'Claude Code slash-menu affordance',
  arguments: 'Claude Code argument substitution',
  'disable-model-invocation': 'Claude Code invocation control',
  'user-invocable': 'Claude Code invocation control',
  'disallowed-tools': 'Claude Code tool-pool restriction',
  context: 'forked subagent context is Claude Code-only',
  agent: 'subagent type selection is Claude Code-only',
  background: 'background execution is Claude Code-only',
  hooks: 'lifecycle hooks are a Claude Code runtime feature',
  paths: 'glob-scoped activation is Claude Code-only',
  shell: 'inline shell selection is Claude Code-only',
  maxTurns: 'no target equivalent',
  permissionMode: 'no target equivalent',
  skills: 'skill preloading is Claude Code-only',
  memory: 'no target equivalent',
  isolation: 'no target equivalent',
  color: 'no target equivalent',
  initialPrompt: 'no target equivalent',
};

const SKILL_FIELDS = [
  'name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools',
  'when_to_use', 'argument-hint', 'arguments', 'disable-model-invocation',
  'user-invocable', 'disallowed-tools', 'model', 'effort', 'context', 'agent',
  'background', 'hooks', 'paths', 'shell',
];

const AGENT_FIELDS = [
  'name', 'description', 'tools', 'model', 'maxTurns', 'permissionMode', 'effort',
  'mcpServers', 'disallowedTools', 'skills', 'hooks', 'memory', 'background',
  'isolation', 'color', 'initialPrompt',
];

// Fields with no canonical value mapping — always DECIDE, never auto-converted.
const DECIDE_REASON = {
  model: 'model IDs are not bijective across platforms — pick the target family deliberately',
  effort: "reasoning-effort enums are disjoint; 'max' has no equivalent on several targets",
  tools: 'tool names are many-to-one across platforms (Grep/Glob → search) — no canonical map',
  'allowed-tools': 'tool names differ per platform — verify each entry against target docs',
  mcpServers: 'MCP wiring and secret prefixes differ per platform',
};

function disposition(field, tgt) {
  if (tgt === 'claude') return ['PORTABLE', ''];
  if (field === 'name' || field === 'description') return ['PORTABLE', ''];

  if (DECIDE_REASON[field]) {
    // Gemini agents keep mcpServers verbatim; Gemini skills carry no tool fields at all.
    if (tgt === 'gemini' && field === 'mcpServers' && artifact === 'agent') {
      return ['PORTABLE', ''];
    }
    if (tgt === 'gemini') {
      return ['DROPPED', 'Gemini skills carry name + description only'];
    }
    return ['DECIDE', DECIDE_REASON[field]];
  }

  if (['license', 'compatibility', 'metadata'].includes(field)) {
    if (tgt === 'agentskills') return ['PORTABLE', ''];
    if (tgt === 'gemini') return ['DROPPED', 'Gemini skills carry name + description only'];
    return ['DECIDE', 'verify against current target docs — not documented in our taxonomy'];
  }

  return ['DROPPED', CLAUDE_ONLY_REASON[field] ?? 'no target equivalent'];
}

function renderTarget(tgt) {
  const fields = artifact === 'agent' ? AGENT_FIELDS : SKILL_FIELDS;
  const buckets = { PORTABLE: [], DROPPED: [], DECIDE: [] };

  for (const f of fields) {
    const [bucket, reason] = disposition(f, tgt);
    buckets[bucket].push(reason ? `${f} — ${reason}` : f);
  }

  const lines = [];
  lines.push('');
  lines.push(`FIELD DISPOSITION — ${artifact} → ${tgt}`);
  lines.push('');
  lines.push(`  PORTABLE  ${buckets.PORTABLE.join(', ') || '(none)'}`);
  lines.push('');
  if (buckets.DROPPED.length) {
    lines.push('  DROPPED');
    for (const d of buckets.DROPPED) lines.push(`            ${d}`);
    lines.push('');
  }
  if (buckets.DECIDE.length) {
    lines.push('  DECIDE    (human decision required — not resolved here)');
    for (const d of buckets.DECIDE) lines.push(`            ${d}`);
    lines.push('');
  }

  // Target-specific notes that aren't field-shaped.
  const NOTES = {
    codex: [
      'Codex agents are TOML — the markdown body becomes the required `developer_instructions` string.',
      'Codex skill frontmatter is undocumented in our taxonomy — treat as name + description and verify.',
    ],
    copilot: [
      'Copilot agent bodies are capped at 30,000 characters.',
      'MCP secrets need the COPILOT_MCP_ prefix; `model` is ignored on github.com.',
    ],
    gemini: ['Gemini subagents cannot spawn subagents; `kind: remote` means A2A.'],
    agentskills: ['name ≤64 and description ≤1,024 are hard spec limits, not warnings.'],
    claude: [],
  };
  if (NOTES[tgt]?.length) {
    lines.push('  NOTES');
    for (const n of NOTES[tgt]) lines.push(`            ${n}`);
    lines.push('');
  }

  lines.push('  Write the DROPPED and DECIDE rows to MIGRATION-NOTES.md beside the ported artifact.');
  return lines.join('\n');
}

// ── Output ────────────────────────────────────────────────────────────────────

if (warnings.length > 0) {
  process.stdout.write(`${warnings.join('\n')}\n`);
}

if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('SUCCESS: metadata valid.\n');

if (target) {
  process.stdout.write(`${renderTarget(target)}\n`);
}

process.exit(0);
