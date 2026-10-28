/**
 * Shared context loader for every interface-suite flow that needs to know
 * "who is this for" and "what does this look like".
 *
 * Input: project root (process.cwd()).
 *
 * Output (JSON to stdout):
 *   {
 *     hasDesign: boolean,            // DESIGN.md found
 *     design: string | null,         // DESIGN.md contents
 *     designPath: string | null,     // relative path
 *     hasSidecar: boolean,           // .interface/design.json found
 *     sidecarPath: string | null,
 *     hasLegacyProduct: boolean,     // legacy PRODUCT.md found — fold via interface-init
 *     legacyProduct: string | null,  // contents (kept so flows retain strategic
 *                                    // context until the fold has run)
 *     legacyProductPath: string | null,
 *     contextDir: string,            // absolute dir the files were found in
 *   }
 *
 * DESIGN.md is the single context file: visual system in tokens + visual
 * sections, strategic layer (register, users, personality, principles,
 * accessibility) in the Overview subsections, anti-references in Do's and
 * Don'ts. Machine-readable strategic fields live in the sidecar's
 * `strategic` block. A PRODUCT.md is a legacy artifact from older versions
 * of this suite: it is still read and reported so nothing breaks
 * mid-migration, but flows should treat `hasLegacyProduct: true` as a
 * one-time prompt to run the interface-init migration (fold PRODUCT.md
 * into DESIGN.md, then delete it).
 *
 * Filename matching is case-insensitive. The Google DESIGN.md convention is
 * uppercase at repo root; lowercase variants are matched so users don't get
 * punished for case.
 *
 * Lookup directory resolution (first match wins):
 *   1. process.env.INTERFACE_CONTEXT_DIR (absolute or relative to cwd)
 *   2. cwd, if DESIGN.md / PRODUCT.md is there
 *   3. Auto-fallback subdirectories of cwd: .agents/context/, then docs/
 *   4. cwd as a default "no context found" location
 */

import fs from 'node:fs';
import path from 'node:path';

const DESIGN_NAMES = ['DESIGN.md', 'Design.md', 'design.md'];
const LEGACY_PRODUCT_NAMES = ['PRODUCT.md', 'Product.md', 'product.md'];
const FALLBACK_DIRS = ['.agents/context', 'docs'];

/**
 * Resolve the directory that holds DESIGN.md (and possibly a legacy
 * PRODUCT.md) for this project. Exported so other scripts (e.g.
 * live-server.mjs) can read the design files from the same location the
 * loader uses.
 */
export function resolveContextDir(cwd = process.cwd()) {
  // 1. Explicit override
  const envDir = process.env.INTERFACE_CONTEXT_DIR;
  if (envDir && envDir.trim()) {
    const trimmed = envDir.trim();
    return path.isAbsolute(trimmed) ? trimmed : path.resolve(cwd, trimmed);
  }

  // 2. cwd wins if any canonical or legacy file is there
  if (firstExisting(cwd, [...DESIGN_NAMES, ...LEGACY_PRODUCT_NAMES])) {
    return cwd;
  }

  // 3. Auto-fallback subdirs
  for (const rel of FALLBACK_DIRS) {
    const candidate = path.resolve(cwd, rel);
    if (firstExisting(candidate, [...DESIGN_NAMES, ...LEGACY_PRODUCT_NAMES])) {
      return candidate;
    }
  }

  // 4. Nothing found — keep the historical "default to cwd" behaviour so the
  //    caller's `hasDesign === false` branch still fires the same way.
  return cwd;
}

export function loadContext(cwd = process.cwd()) {
  const contextDir = resolveContextDir(cwd);

  const designPath = firstExisting(contextDir, DESIGN_NAMES);
  const legacyProductPath = firstExisting(contextDir, LEGACY_PRODUCT_NAMES);

  // Sidecar always lives under the project root, not the context dir —
  // .interface/ is per-repo state.
  const sidecarPath = firstExisting(path.join(cwd, '.interface'), ['design.json']);

  const design = designPath ? safeRead(designPath) : null;
  const legacyProduct = legacyProductPath ? safeRead(legacyProductPath) : null;

  return {
    hasDesign: !!design,
    design,
    designPath: designPath ? path.relative(cwd, designPath) : null,
    hasSidecar: !!sidecarPath,
    sidecarPath: sidecarPath ? path.relative(cwd, sidecarPath) : null,
    hasLegacyProduct: !!legacyProduct,
    legacyProduct,
    legacyProductPath: legacyProductPath ? path.relative(cwd, legacyProductPath) : null,
    contextDir,
  };
}

function firstExisting(dir, names) {
  for (const name of names) {
    const abs = path.join(dir, name);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

function safeRead(p) {
  try { return fs.readFileSync(p, 'utf-8'); } catch { return null; }
}

// ---------------------------------------------------------------------------
// CLI mode — print the context as JSON
// ---------------------------------------------------------------------------

function cli() {
  const result = loadContext(process.cwd());
  console.log(JSON.stringify(result, null, 2));
}

const _running = process.argv[1];
if (_running?.endsWith('load-context.mjs') || _running?.endsWith('load-context.mjs/')) {
  cli();
}
