# Report Template

Use this exact structure for all evaluation reports.

```markdown
# Prompt Evaluation Report: [Name]

## Executive Summary
[1–2 sentences max. Overall verdict + one top strength or weakness. No scores, no tables, no lists — prose only.]

## Summary
- **Type**: [Skill / Agent / System Prompt / Other] + applicable groups
- **Score**: X / Y (Z%)
- **Grade**: [A/B/C/D/F]
- **Knowledge Ratio**: Expert:Activation:Redundant = X:Y:Z
- **Verdict**: [One sentence assessment]

## Group Scores

| Group | Score | Max | % |
|-------|-------|-----|---|
| U: Universal | | 80 | |
| S: Skill | | 40 | | ← if applicable
| C: Agent/Prompt | | 40 | | ← if applicable
| B: Bash/Shell | | 30 | | ← if applicable
| **Total** | | | |

## Dimension Scores

Include only rows for groups detected in Step 0. Omit rows for groups that don't apply.

| ID | Dimension | Score | Max | Notes |
|----|-----------|-------|-----|-------|
| U1 | Knowledge/Instruction Delta | | 20 | One-line justification + primary gap if score < max |
| U2 | Mindset + Procedures | | 15 | |
| U3 | Constraint Quality | | 15 | |
| U4 | Freedom Calibration | | 15 | |
| U5 | Practical Usability | | 15 | |
| S1 | Specification Compliance | | 15 | |
| S2 | Progressive Disclosure | | 15 | |
| S3 | Pattern Recognition | | 10 | |
| C1 | Behavioral Clarity | | 15 | |
| C2 | Scope Definition | | 15 | |
| C3 | Structural Organization | | 10 | |
| B1 | Rule Specificity & WHY | | 10 | |
| B2 | Anti-Pattern Coverage | | 10 | |
| B3 | Scope & Exceptions | | 10 | |

## Critical Issues
[Must-fix problems that significantly impact effectiveness]

## Detailed Analysis
[For each dimension scoring below 80%, provide:
- What's missing or problematic
- Specific evidence with line numbers
- Concrete suggestions for improvement]

## Numbered Improvements
1. [Highest impact improvement with specific guidance]
2. [Second priority]
3. ...

Step through these with ai-forge-apply? (y)es / (n)o
```
