#!/usr/bin/env node
// Shape check for meridian artifacts — the parts route.md and PLAN.template.md fix, nothing more.
//   node validate-map.mjs map  <file|->   map body: the seven sections, in order; Decision log Via values
//   node validate-map.mjs item <file|->   route item body: required headings in order, checkbox criteria,
//                                         Known locations entries that name their source, no paths where they rot
// `-` reads stdin, so a tracker body pipes in: gh issue view <n> --json body --jq .body | node validate-map.mjs item -
// Prints `ERROR <rule> — <detail>` and `WARN <rule> — <detail>` lines.
// Exit 0: no errors (warnings allowed). Exit 1: rejected — at least one ERROR. Exit 2: usage or unreadable input.
import { readFileSync } from "node:fs";

const MAP_SECTIONS = ["Destination", "Bearings", "Decision log", "Frontier", "Fog", "Ruled out", "Route"];
const ITEM_SECTIONS = ["Parent", "What to build", "Acceptance criteria", "Blocked by", "Landing", "Seams", "Known locations", "From decisions"];
const OPTIONAL = new Set(["Landing"]);
const VIA = /^[JRETI](→[JRETI])*$/; // a type, or a chain such as R→J when research turned into a judgment
const PATHISH = /(^|[\s`(])[\w.-]+\/[\w./-]*\.[a-z]{1,5}(:\d+)?\b/i;

function sections(body) {
  const out = [];
  for (const [i, line] of body.split("\n").entries()) {
    const h = line.match(/^## (.+?)\s*$/);
    if (h) out.push({ name: h[1], line: i + 1, text: [] });
    else if (out.length) out.at(-1).text.push(line);
  }
  return out;
}

function inOrder(found, wanted, report) {
  let last = -1;
  for (const name of wanted) {
    const at = found.findIndex((s) => s.name === name);
    if (at === -1) {
      if (!OPTIONAL.has(name)) report("ERROR", "section-missing", `## ${name}`);
      continue;
    }
    if (at < last) report("ERROR", "section-order", `## ${name} (line ${found[at].line}) is out of order`);
    last = Math.max(last, at);
  }
}

export function validateMap(body) {
  const issues = [];
  const report = (level, rule, detail) => issues.push({ level, rule, detail });
  const found = sections(body);
  inOrder(found, MAP_SECTIONS, report);
  const log = found.find((s) => s.name === "Decision log");
  for (const row of log?.text ?? []) {
    const cells = row.split("|").map((c) => c.trim());
    if (cells.length < 5 || !/^\d+$/.test(cells[1])) continue;
    const via = cells[cells.length - 2];
    if (!VIA.test(via)) report("WARN", "via", `Decision log row ${cells[1]} has Via "${via}"`);
  }
  return issues;
}

export function validateItem(body) {
  const issues = [];
  const report = (level, rule, detail) => issues.push({ level, rule, detail });
  const found = sections(body);
  inOrder(found, ITEM_SECTIONS, report);
  const get = (name) => found.find((s) => s.name === name)?.text.join("\n").trim() ?? null;

  const criteria = get("Acceptance criteria");
  if (criteria !== null && !/^- \[[ xX]\] /m.test(criteria)) {
    report("ERROR", "criteria", "Acceptance criteria has no `- [ ]` line");
  }
  const seams = get("Seams");
  if (seams !== null && !seams) report("ERROR", "seams", "Seams is empty");

  const locations = get("Known locations");
  if (locations !== null && !/^\**None established\.?\**$/.test(locations)) {
    const entries = locations.split("\n").filter((l) => l.startsWith("- "));
    if (!entries.length) report("ERROR", "locations", "Known locations is neither entries nor `None established.`");
    for (const e of entries) {
      if (!/\bfrom:\s*\S/.test(e)) report("ERROR", "locations-source", `entry names no source: ${e.slice(0, 80)}`);
    }
  }
  for (const name of ["What to build", "Acceptance criteria", "Landing"]) {
    const text = get(name);
    if (text && PATHISH.test(text)) report("WARN", "path-rots", `a file path in ## ${name} — paths belong in Known locations`);
  }
  return issues;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  const [kind, src] = process.argv.slice(2);
  if (!["map", "item"].includes(kind) || !src) {
    console.error("usage: validate-map.mjs map|item <file|->");
    process.exit(2);
  }
  let body;
  try {
    body = readFileSync(src === "-" ? 0 : src, "utf8");
  } catch (e) {
    console.error(`validate-map: unreadable input — ${e.message}`);
    process.exit(2);
  }
  const issues = kind === "map" ? validateMap(body) : validateItem(body);
  for (const i of issues) console.log(`${i.level} ${i.rule} — ${i.detail}`);
  process.exit(issues.some((i) => i.level === "ERROR") ? 1 : 0);
}
