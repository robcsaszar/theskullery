# Channel Rules — Scoring and Rewrite

## Scoring Dimensions

### Blog Post and Social Media

| Dimension | What it measures | Target |
|-----------|-----------------|--------|
| **AI-Likeness** | How much AI texture the content has (lower is better) | 1–3 |
| **Authenticity** | How unmistakably it sounds like a specific human | 8–10 |
| **Reader Value** | Would the target audience find this non-obvious? | 7–10 |
| **Domain Credibility** | Does it require specific background or experience to write? | 7–10 |

### Email

| Dimension | What it measures | Target |
|-----------|-----------------|--------|
| **AI-Likeness** | How much AI texture the email has (lower is better) | 1–3 |
| **Authenticity** | How much it sounds like a real person writing to this specific recipient | 8–10 |
| **Clarity** | Is the purpose clear and the ask unambiguous? | 8–10 |
| **Appropriate Tone** | Is the formality level right for this relationship and context? | 8–10 |

### IM

| Dimension | What it measures | Target |
|-----------|-----------------|--------|
| **AI-Likeness** | How much AI texture the message has (lower is better) | 1–2 |
| **Naturalness** | Does it sound like how this person would actually type in an IM? | 8–10 |
| **Clarity** | Is the point or ask immediately clear? | 8–10 |
| **Brevity** | Is it the right length for an IM? | 8–10 |

### Documentation

Documentation is not scored on Authenticity. Nobody needs a runbook to sound like a specific human; they need it to be right and followable.

| Dimension | What it measures | Target |
|-----------|-----------------|--------|
| **AI-Likeness** | How much AI texture the text has (lower is better) | 1–3 |
| **Task Completion** | Can a reader do the thing without guessing or leaving the page? | 8–10 |
| **Precision** | Are the terms, values, commands, and conditions exact? | 9–10 |
| **Consistency** | Is the same thing called the same name throughout? | 8–10 |

### Creative

| Dimension | What it measures | Target |
|-----------|-----------------|--------|
| **AI-Likeness** | How much AI texture the piece has (lower is better) | 1–3 |
| **Voice** | Do the narration and each character sound like themselves? | 8–10 |
| **Concrete Specificity** | Is it built from particular detail rather than category summary? | 7–10 |
| **Restraint** | Does it trust the reader, or does it state its own moral? | 7–10 |

**Important:** If AI-Likeness is low but Domain Credibility (blog/social media), Clarity (email/IM), Task Completion (documentation), or Restraint (creative) is also low, call this out explicitly. Content can be clean but hollow.

---

## Channel-Specific Rewrite Rules

### Blog Post

- Preserve heading structure; improve heading copy if generic (use scannable statements, not category labels)
- Ensure prose paragraphs vary in length
- Replace any "In this article" or "Let's dive in" meta-commentary — start with the substance
- Replace summary conclusions with a challenge, principle, or open question
- If the piece lacks a concrete example anywhere, leave `[ADD SPECIFIC EXAMPLE FROM YOUR EXPERIENCE]`

### Social Media

- Keep under 1,300 characters (short-form) or 3,000 characters (long-form)
- Do not stack hashtags at the bottom; weave 1–3 naturally or drop them
- Remove engagement bait closers entirely
- Replace arrow-chain formats (`X → Y → Z`) with real sentences
- Replace one-line-per-paragraph with actual paragraph structure (2–4 sentences per paragraph)
- Remove decorative emoji; keep only emoji with genuine communicative purpose
- Do not add a link in the post body; place it in the first comment after engagement begins
- Replace the hook if it games Stage 1 but would die at Stage 2 (see `ai-patterns-channels.md → Social media hook calibration`)

### Email

- Lead with the ask or purpose, not context
- Cut to minimum length; most AI emails are 2–3× too long
- Match formality to the relationship
- Use a specific CTA: "Free Tuesday at 2?" not "Let's chat sometime"
- One ask per email
- Remove performative politeness; one "thanks" is enough
- Subject line: specific to the content, not a template label ("Quick question", "Following up")
- Opening: skip "I hope this finds you well"; start with the point
- Closing: pick one sign-off; do not stack three

### IM

- Maximum 4–5 sentences; if longer, suggest moving to email or a doc
- Lead with the ask or action item
- No formal greeting or sign-off
- Match the casual tone of the channel
- If sharing a link: one sentence of context, not a paragraph summary

### Documentation

- One action or statement per sentence; split any sentence carrying two
- Write each step as condition, action, and expected result, so the reader can tell whether the step worked
- Give positive instructions: say what to do, not only what to avoid
- Use the same term for the same thing every time; never vary a term to avoid repetition
- Keep noun groups short and use prepositions to show the relationship: "the policy for updating retained customer data", not "the customer data retention policy update process"
- Name the actor when the actor matters — "the service rejects the token", not "the token is rejected"
- Define a technical term on first use, or link to its definition; do not replace it with a vaguer everyday word
- Preserve code, commands, flags, identifiers, product names, legal text, and quotations exactly
- Do not remove headings, numbered steps, or lists for style reasons; structure is what makes a procedure usable
- Uniform paragraph shape and steady sentence length are correct here — do not vary them to break regularity

### Creative

- The em-dash rule is suspended inside dialogue and verse; keep the dash where the interruption is the point
- Preserve intentional ambiguity, cadence, fragments, and each character's register
- Do not resolve tension the piece deliberately leaves open
- Cut the closing line that explains what the piece meant; that is the strongest creative-writing AI tell
- Remove only language that is inherited, inflated, evasive, or lazy — not language that is strange on purpose
- Do not add a moral, a summary, or a thesis the draft did not have
