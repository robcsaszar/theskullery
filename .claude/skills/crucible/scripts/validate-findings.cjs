#!/usr/bin/env node
/**
 * Validates findings.json against findings-schema.json.
 * Usage: node validate-findings.cjs <path-to-findings.json>
 *
 * Reads the schema at runtime — findings-schema.json is the single source of truth.
 * Interprets: type, properties, required, additionalProperties:false, enum, const,
 * items, minItems, oneOf.
 *
 * Semantic constraint (not expressible in the schema subset):
 *   Confirmed findings must not have verification: "pending" before SPEC phase.
 *   This is checked only when --pre-spec flag is passed.
 *
 * Zero dependencies. Exits 0 on pass, 1 on failure.
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const preSpec = args.includes("--pre-spec");

if (!file) {
  console.error("Usage: node validate-findings.cjs <findings.json> [--pre-spec]");
  process.exit(1);
}

const schemaPath = path.join(__dirname, "..", "assets", "findings-schema.json");
let itemSchema;
try {
  const doc = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  itemSchema = doc.output_schema.items;
  if (!itemSchema) throw new Error("findings-schema.json missing output_schema.items");
} catch (e) {
  console.error(`Failed to load schema: ${e.message}`);
  process.exit(1);
}

let findings;
try {
  findings = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (e) {
  console.error(`Failed to parse JSON: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(findings)) {
  console.error("findings.json must be an array");
  process.exit(1);
}

// --- JSON Schema interpreter (subset used by findings-schema.json) ---

function typeOf(v) {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  return typeof v;
}

function findDiscriminator(schema) {
  if (!schema.properties) return null;
  for (const [key, sub] of Object.entries(schema.properties)) {
    if (sub && Object.prototype.hasOwnProperty.call(sub, "const")) {
      return { key, value: sub.const };
    }
  }
  return null;
}

function validate(value, schema, p, errors) {
  if (schema.oneOf) {
    for (const branch of schema.oneOf) {
      const disc = findDiscriminator(branch);
      if (disc && value && typeof value === "object" && value[disc.key] === disc.value) {
        validate(value, branch, p, errors);
        return;
      }
    }
    const discs = schema.oneOf.map(findDiscriminator).filter(Boolean);
    if (discs.length === schema.oneOf.length && value && typeof value === "object") {
      const key = discs[0].key;
      const allowed = discs.map((d) => JSON.stringify(d.value)).join(", ");
      errors.push(`${p}: "verdict" must be one of ${allowed}, got ${JSON.stringify(value[key])}`);
      return;
    }
    const passing = schema.oneOf.filter((b) => collect(value, b, p).length === 0);
    if (passing.length !== 1) errors.push(`${p}: does not match exactly one schema`);
    return;
  }

  if (Object.prototype.hasOwnProperty.call(schema, "const") && value !== schema.const) {
    errors.push(`${p}: must equal ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${p}: invalid value ${JSON.stringify(value)} (allowed: ${schema.enum.map((v) => JSON.stringify(v)).join(", ")})`);
  }

  switch (schema.type) {
    case "object":
      if (typeOf(value) !== "object") { errors.push(`${p}: expected object, got ${typeOf(value)}`); return; }
      for (const req of schema.required || []) {
        if (!(req in value)) errors.push(`${p}: missing required field "${req}"`);
      }
      for (const key of Object.keys(value)) {
        if (schema.properties && key in schema.properties) {
          validate(value[key], schema.properties[key], `${p}.${key}`, errors);
        } else if (schema.additionalProperties === false) {
          errors.push(`${p}: unexpected field "${key}"`);
        }
      }
      break;
    case "array":
      if (typeOf(value) !== "array") { errors.push(`${p}: expected array, got ${typeOf(value)}`); return; }
      if (typeof schema.minItems === "number" && value.length < schema.minItems) {
        errors.push(`${p}: must have at least ${schema.minItems} item(s), got ${value.length}`);
      }
      if (schema.items) value.forEach((el, i) => validate(el, schema.items, `${p}[${i}]`, errors));
      break;
    case "integer":
      if (typeOf(value) !== "number" || !Number.isInteger(value)) errors.push(`${p}: expected integer`);
      break;
    case "string":
      if (typeOf(value) !== "string") errors.push(`${p}: expected string, got ${typeOf(value)}`);
      break;
  }
}

function collect(value, schema, p) {
  const errors = [];
  validate(value, schema, p, errors);
  return errors;
}

// --- Run ---

let errorCount = 0;

findings.forEach((f, i) => {
  const label = `[${i}] ${f?.id ?? "(no id)"} — ${f?.title ?? f?.reason ?? "(untitled)"}`;
  console.log(`Checking ${label}`);

  const errs = collect(f, itemSchema, `[${i}]`);

  // Semantic layer: every confirmed finding must be verified before SPEC
  if (preSpec && f?.verdict === "confirmed") {
    if (!f.verification || f.verification === "pending") {
      errs.push(`[${i}]: confirmed finding "${f.id}" has verification: "pending" — run Phase 4 before writing SPEC`);
    }
  }

  for (const msg of errs) console.error("  ERROR:", msg);
  errorCount += errs.length;
});

console.log();
if (errorCount === 0) {
  console.log(`PASS — ${findings.length} findings valid`);
} else {
  console.error(`FAIL — ${errorCount} error(s) across ${findings.length} findings`);
  process.exit(1);
}
