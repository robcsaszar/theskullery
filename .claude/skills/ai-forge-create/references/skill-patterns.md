# Skill Pattern Selection Guide

Choose the pattern that matches what the skill must do, not what it looks like it should do.

---

## The Five Patterns

| Pattern | Lines | Freedom | Use When |
|---------|-------|---------|----------|
| **Mindset** | ~50 | High | Task requires taste and judgment; multiple valid outputs; expert = distinctive choices |
| **Navigation** | ~30 | Medium | 3+ distinct sub-scenarios; each needs its own file; routing is the whole job |
| **Philosophy** | ~150 | High | Craft or originality is the output; two-step: internalize principles → express |
| **Process** | ~200 | Medium | Multi-step project; order matters; checkpoints needed; recoverable on failure |
| **Tool** | ~300 | Low | Precise operations on a specific format; one wrong step corrupts output |

---

## Decision Tree

```text
Does the task have one correct output?
│
├── YES → Is the output a specific file format or system state?
│          ├── YES → Tool pattern (exact steps, low freedom)
│          └── NO  → Process pattern (phased workflow, checkpoints)
│
└── NO  → Is the value in distinctive choices (taste, originality)?
           ├── YES → Does it require deep internalization before expression?
           │          ├── YES → Philosophy pattern (principles first, then create)
           │          └── NO  → Mindset pattern (strong NEVER list, high freedom)
           └── NO  → Does it need to route to different sub-scenarios?
                      ├── YES → Navigation pattern (thin router, sub-files do the work)
                      └── NO  → Mindset pattern (principles + judgment)
```

---

## Pattern Signatures

### Mindset (~50 lines)

- Strong NEVER list (5+ items with WHY)
- Thinking frameworks ("Before X, ask yourself...")
- No step-by-step sequences
- High freedom — principles, not procedures
- Example body structure: Philosophy → NEVER → One trigger question

### Navigation (~30 lines)

- SKILL.md is almost entirely routing logic
- Each route points to a separate reference file
- No inline content — the sub-files hold everything
- Body: detect scenario → load file → follow it

### Philosophy (~150 lines)

- Two explicit phases: absorb → express
- Phase 1: principles, reference works, aesthetic constraints
- Phase 2: creation with those principles active
- Anti-patterns are aesthetic ("NEVER make it look AI-generated")
- Freedom: high, but constrained by internalized principles

### Process (~200 lines)

- Numbered phases (Discovery → Draft → Review → Ship)
- Each phase has a clear exit condition
- Checkpoints at phase boundaries ("do not proceed until...")
- Error recovery: what to do when a step fails
- Freedom: medium — structure is fixed, content within steps is not

### Tool (~300 lines)

- Decision trees for format-specific choices
- Exact commands or API calls (no paraphrasing)
- MANDATORY READ triggers for reference files
- Fallback paths for common failure modes
- Freedom: low — correctness is the only goal

---

## Common Mismatches

**Picking Tool when Process is right**: Tool pattern for a multi-step workflow that isn't format-specific → over-constrains the agent.

**Picking Mindset when Tool is right**: "Think about good formatting" for a task where one wrong field corrupts the file → agent guesses when it should follow exact steps.

**Picking Process when Navigation is right**: Long SKILL.md with inline content for 4 different sub-domains → loads everything every time; better to route and load only what's needed.

**Picking Philosophy for technical tasks**: Philosophy is for art/craft/design. Don't use it for structured outputs — the "internalize then express" loop creates unpredictability where precision is needed.
