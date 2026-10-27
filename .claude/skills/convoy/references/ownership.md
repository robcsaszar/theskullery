# Ownership

Who owns every uncommitted path, decided before any agent runs. Loaded at wave assembly.

Every uncommitted file has exactly one owner, and the orchestrator knows who before any agent runs:

- **User** — any path dirty at Phase 0 or changed by a commit the convoy did not make. On every brief's off-limits list; never restored, never staged.
- **Orchestrator** — shared files every item would otherwise touch: `docs/flows/*`, `docs/project.md`, `docs/components.md`, `src/lib/page-config.ts`, `src/lib/legal/ledger.ts`, `bruno/`, `CONTEXT.md`, `UBIQUITOUS_LANGUAGE.md`, and the shared test fixtures every suite reads — `tests/fixtures/*.json`, `e2e/seed.spec.ts`, any file three briefs would otherwise name. Agents report the lines they need; the orchestrator writes them at the gate, in the item's commit. Without this, every wave has one item.
- **Wave-hub** — a code file two or more items in the same wave predict (`quizSession.svelte.ts` held three waves apart). Decided at wave assembly, never mid-wave: named in every brief of that wave as orchestrator-owned *for that wave only*; agents report the lines, the orchestrator writes them at the gate. The test is "two items *predict* it", not "might touch it" — declared eagerly, every wave shrinks to one item plus reports.
- **An agent** — its predicted file set, from the item's body and seams. Unpredictable owner → on every other agent's off-limits list; a report saying "I needed X" is cheaper than a collision.

Revert scope for an item is its predicted set ∪ its reported set. Paths outside both are left in place and named in the report. A user path inside an item's predicted set holds that item, with a comment on its ticket; a user path in the orchestrator list means those lines go in the ticket comment, not the tree.
