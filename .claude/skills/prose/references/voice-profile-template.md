# Voice Profile (template)

Filled in during Voice Calibration from writing samples the author produced without AI — ideally 3–5 texts, 2,000+ words total, spanning the genres the skill will serve. The completed copy is saved as `references/voice-profile.md`. Until that file exists, the skill runs on defaults.

Rules for filling it in:

- Every entry must be backed by an observation from the samples, never a guess. No observation → leave the entry empty and the default stands.
- Record how the author actually writes, including habits an editor would flag. The rough edges are the signature; cleaning them out erases the voice.
- A profile can adjust conventions and preserve tics. It can never: permit invented facts, norms, or thresholds; weaken fact discipline or accessibility; or request imitation of another named author.
- The file is plain markdown, editable by hand. On "learn from this text too": append dated observations rather than rewriting; when observations conflict, the fresher sample wins, with a dated note.

---

## 1. Typography and mechanics

- Em dashes: [uses freely / sparing, unspaced / avoids] — if allowed, pass `--allow em-dash` to the scanner
- Quotation marks: [straight / curly] — hold one style
- Headings: [sentence case / Title Case / avoids headings]
- Lists vs. prose: [reaches for bullets / writes in paragraphs / mixed]
- Bold and italics: [what gets emphasized, how often]
- Other habits: [parentheses, ellipses, ALL CAPS, emoji — what and where]

## 2. Vocabulary

- Words and connectives the author actually uses (preserve in rewrites): [...]
- Words the author never uses (never insert, even ordinary ones): [...]
- Professional jargon and its exact spelling: [e.g. "repo" vs "repository"]
- Reader address: ["you" freely / impersonal / "we"]
- Spelling: [American / British], and whether it matches the audience

## 3. Rhythm and structure

- Typical sentence length and mix: [clipped / long with subclauses / alternating]
- How texts open: [claim / scene / question / number]
- How texts close: [decision / action / cuts off / joke / open question]
- Paragraph habits: [short 1–3 sentences / long / varies by section]
- Transitions actually used in the samples: [the exact words]

## 4. Tics to protect

Constructions that recur across samples and read as the author's voice — these must survive every rewrite. Candidates: signature openers, rhetorical questions, parenthetical asides, self-interruption, deliberate fragments, specific intensifiers.

- [...]

## 5. Registers by channel

For each channel the author supplied samples of:

- [Channel]: [how this register differs — length, formality, humor tolerance, formatting]

## 6. Explicit instructions

Anything the author asked for directly, quoted verbatim: [...]

## 7. Scanner allowances

Rule ids to pass as `--allow` when running `scripts/slop-scan.py` on this author's text, each with the observation that justifies it:

- [rule-id]: [justification from samples]

---

Calibrated: [date]
Samples: [count, genres, total length]
Updates: [date — what was added]
