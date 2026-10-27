#!/usr/bin/env node
// Checks claims about the repo for the `verifier` agent. Code decides everything exact — the path
// exists (in the tree or at a commit), the cited line holds the literal `text`, where else that
// text sits. The decision engine (TypeSafe Jev) makes one narrow judgment code cannot: which of
// the candidate lines holds the construct a claim only `describes`. It never generates a line,
// only picks one of the candidates code offers, or `none`.
// Without TYPESAFE_API_KEY, or when the engine fails or is unsure, the claim comes back UNSURE
// with its candidates so the agent reads them itself. Code lines (no user or player text) are
// sent to the hosted engine.
//
// Input (stdin): [{"id","path","line"?,"text"?,"describes"?,"sha"?}, ...], or with --lines the claim lines
// as a brief writes them — see parseClaimLines.
// Output (stdout): [{"id","verdict":"VERIFIED|CORRECTED|REJECTED|UNSURE","path","line","to"?,"toText"?,"at"?,"reason","candidates"?,"engine"?}, ...]
// `toText` is the text of the corrected line; `at` is the cited line's text on a REJECTED claim;
// `report` is the claim's finished line for the verifier's report.
// Exit 1 only on unreadable input; every claim gets a verdict otherwise.
//
// --probe <file>: claims that also carry `want` (the true line, a list of acceptable lines, or null),
// pinned with `sha` — a JSON array of claims from this repo. Prints each engine pick and the highest
// confidence any wrong pick reached, the evidence ACT_CONFIDENCE rests on. Needs the engine key.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ENGINE_URL = "https://api.typesafe.ai/v1/systemone";
// ACT_CONFIDENCE was fitted against this model; a new model needs `--probe <file>` run again.
const ENGINE_MODEL = "jev-1.13.0";
// Jev Choice confidence = (n·top − 1)/(n − 1). Over three runs of 29 labelled claims from
// another codebase, every wrong pick scored 0.88 or less and every pick at 0.9 or more was
// right; below the bar the agent reads the candidate lines itself.
const ACT_CONFIDENCE = 0.9;
const MAX_CANDIDATES = 250; // Jev Choice cap is 255 options; `none` takes one
const SHOWN = 10; // candidate lines listed back in an UNSURE result; the rest as a range
const RETRIES = 2;
const STOPWORDS = new Set(
  "that this with from where which when what line lines list rows heading section function block export const return".split(" "),
);
const LOCATE_INSTRUCTIONS =
  "Which line in `lines` is the one `claim` describes? `claim` names one construct — a heading, a declaration, a call, a table row, a rule. Pick the line where that construct is written, not a line that only mentions or references it. When `claim` names one entry, row, or item inside a list, table, or object, pick the line where that entry starts, not the line that declares the list. Pick `none` when no line in `lines` holds it.";

const norm = (s) => s.replace(/\s+/g, " ").trim();

// Lines that may hold what `describes` names: lines sharing one of its identifier-like words
// first, then the rest nearest the cited line, capped for the engine and returned in file order.
function candidateLines(lines, claim) {
  const words = (claim.describes.toLowerCase().match(/[a-z_][a-z0-9_]{3,}/g) ?? []).filter(
    (w) => !STOPWORDS.has(w),
  );
  const centre = claim.line ?? 1;
  return lines
    .map((text, i) => ({ line: i + 1, text, hit: words.some((w) => text.toLowerCase().includes(w)) }))
    .filter((c) => norm(c.text))
    .sort((a, b) => b.hit - a.hit || Math.abs(a.line - centre) - Math.abs(b.line - centre))
    .slice(0, MAX_CANDIDATES)
    .sort((a, b) => a.line - b.line);
}

// What an UNSURE result carries back: every candidate when few, else the identifier hits (or the
// lines nearest the cited one) plus the range the rest span.
function summarize(candidates, centre = 1) {
  const brief = ({ line, text }) => ({ line, text: text.trim().slice(0, 120) });
  if (candidates.length <= SHOWN) return { candidates: candidates.map(brief) };
  const hits = candidates.filter((c) => c.hit !== false);
  const shown = (hits.length ? hits : candidates)
    .toSorted((a, b) => Math.abs(a.line - centre) - Math.abs(b.line - centre))
    .slice(0, SHOWN)
    .sort((a, b) => a.line - b.line);
  return {
    candidates: shown.map(brief),
    range: [candidates[0].line, candidates[candidates.length - 1].line],
    count: candidates.length,
  };
}

function readSource(claim, cwd) {
  if (claim.sha) {
    try {
      return execFileSync("git", ["show", `${claim.sha}:${claim.path}`], {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      return null;
    }
  }
  const abs = join(cwd, claim.path);
  return existsSync(abs) ? readFileSync(abs, "utf8") : null;
}

function readKey(env, cwd) {
  if (env.TYPESAFE_API_KEY) return env.TYPESAFE_API_KEY;
  const file = join(cwd, ".env");
  if (!existsSync(file)) return null;
  const hit = readFileSync(file, "utf8").match(/^\s*TYPESAFE_API_KEY\s*=\s*["']?([^"'\s]+)/m);
  return hit ? hit[1] : null;
}

async function askEngine(describes, candidates, { key, fetchImpl }) {
  const lines = Object.fromEntries(candidates.map((n) => [`L${n.line}`, n.text]));
  const criteria = Object.fromEntries(Object.keys(lines).map((k) => [k, null]));
  criteria.none = "No line in `lines` holds the construct `claim` describes";
  const body = JSON.stringify({
    model: ENGINE_MODEL,
    state: { claim: describes, lines },
    questions: { locate: { type: "choice", instructions: LOCATE_INSTRUCTIONS, criteria } },
  });
  for (let attempt = 0; ; attempt++) {
    const res = await fetchImpl(ENGINE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body,
    });
    if ((res.status === 429 || res.status === 529) && attempt < RETRIES) {
      const wait = Number(res.headers?.get?.("retry-after")) || 2 ** attempt;
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`engine HTTP ${res.status}`);
    const data = await res.json();
    const a = data.answers.locate;
    return { model: data.model, choice: a.choice, confidence: a.confidence };
  }
}

async function verifyOne(claim, ctx) {
  const out = { id: claim.id, path: claim.path, line: claim.line ?? null };
  const src = readSource(claim, ctx.cwd);
  if (src === null) {
    return { ...out, verdict: "REJECTED", reason: claim.sha ? `path not found at ${claim.sha}` : "path not found" };
  }
  const lines = src.split("\n");
  const at = (n) => lines[n - 1] ?? "";

  if (claim.text) {
    const want = norm(claim.text);
    if (claim.line && norm(at(claim.line)).includes(want)) {
      return { ...out, verdict: "VERIFIED", reason: "cited line holds the text" };
    }
    const hits = lines.flatMap((l, i) => (norm(l).includes(want) ? [{ line: i + 1, text: l }] : []));
    if (hits.length === 0) {
      return { ...out, verdict: "REJECTED", reason: "text not in file", at: at(claim.line ?? 0).trim().slice(0, 120) };
    }
    if (hits.length === 1) {
      const toText = hits[0].text.trim().slice(0, 120);
      return { ...out, verdict: "CORRECTED", to: hits[0].line, toText, reason: "text found on another line" };
    }
    if (!claim.describes) {
      return { ...out, verdict: "UNSURE", reason: `text on ${hits.length} lines`, ...summarize(hits, out.line ?? 1) };
    }
    return pick(out, claim.describes, hits.slice(0, MAX_CANDIDATES), ctx);
  }

  if (!claim.describes) return { ...out, verdict: "REJECTED", reason: "claim has neither text nor describes" };
  return pick(out, claim.describes, candidateLines(lines, claim), ctx);
}

async function pick(out, describes, candidates, ctx) {
  if (!ctx.key) return { ...out, verdict: "UNSURE", reason: "no engine key", ...summarize(candidates, out.line ?? 1) };
  let ans;
  try {
    ans = await askEngine(describes, candidates, ctx);
  } catch (e) {
    return { ...out, verdict: "UNSURE", reason: `engine unavailable: ${e.message}`, ...summarize(candidates, out.line ?? 1) };
  }
  const engine = { model: ans.model, choice: ans.choice, confidence: ans.confidence };
  if (ans.confidence < ACT_CONFIDENCE) {
    return { ...out, verdict: "UNSURE", reason: "engine below confidence bar", ...summarize(candidates, out.line ?? 1), engine };
  }
  if (ans.choice === "none") return { ...out, verdict: "REJECTED", reason: "no candidate line holds it", engine };
  const line = Number(ans.choice.slice(1));
  const toText = (candidates.find((c) => c.line === line)?.text ?? "").trim().slice(0, 120);
  return line === out.line
    ? { ...out, verdict: "VERIFIED", reason: "engine picked the cited line", engine }
    : { ...out, verdict: "CORRECTED", to: line, toText, reason: "engine picked another line", engine };
}

/**
 * Parses claim lines as a brief writes them: `[<id>. | - ]<path>:<line> — <claim>`. A claim in backticks
 * is literal text; anything else describes the line. A trailing `@<sha>` is the commit the claim was read
 * at and only recorded; `check at <sha>` reads the file at that commit instead of the tree.
 */
export function parseClaimLines(input) {
  const claims = [];
  for (const raw of input.split("\n")) {
    const m = raw.match(/^\s*(?:[-*]\s+|(\S+?)[.)]\s+)?([^\s:]+):(\d+)\s+[—–-]+\s+(.+?)\s*$/);
    if (!m) continue;
    let rest = m[4];
    const claim = { id: m[1] ?? String(claims.length + 1), path: m[2], line: Number(m[3]) };
    const checkAt = rest.match(/\bcheck at ([0-9a-f]{7,40})\b/);
    if (checkAt) {
      claim.sha = checkAt[1];
      rest = rest.replace(checkAt[0], "").trim();
    }
    const readAt = rest.match(/\s*@([0-9a-f]{7,40})$/);
    if (readAt) {
      claim.readAt = readAt[1];
      rest = rest.slice(0, readAt.index).trim();
    }
    const literal = rest.match(/`([^`]+)`/);
    if (literal) claim.text = literal[1];
    else claim.describes = rest.replace(/[.;,]$/, "");
    claims.push(claim);
  }
  return claims;
}

const words = (s, n = 12) => s.split(/\s+/).filter(Boolean).slice(0, n).join(" ");

/** The report line the verifier agent copies for a verdict it does not re-decide. */
function reportLine(r) {
  const at = `${r.path}:${r.line ?? "?"}`;
  if (r.verdict === "VERIFIED") return `${r.id} VERIFIED ${at}`;
  if (r.verdict === "CORRECTED") return `${r.id} CORRECTED ${at} → ${r.path}:${r.to} — ${words(r.toText ?? "")}`;
  if (r.verdict === "REJECTED") return `${r.id} REJECTED ${at} — ${r.reason}${r.at ? `; line reads: ${words(r.at)}` : ""}`;
  const lines = (r.candidates ?? []).map((c) => c.line).join(", ");
  return `${r.id} UNSURE ${at} — candidates ${lines}${r.count ? ` (sample of ${r.count})` : ""} — ${r.reason}`;
}

/** Verifies each claim; `env`, `cwd` and `fetchImpl` are injectable so tests never reach the engine. */
export async function verifyClaims(claims, { cwd = process.cwd(), env = process.env, fetchImpl = fetch } = {}) {
  const ctx = { cwd, fetchImpl, key: readKey(env, cwd) };
  const results = [];
  for (const claim of claims) {
    const r = await verifyOne(claim, ctx);
    results.push({ ...r, report: reportLine(r) });
  }
  return results;
}

async function probe(file, root) {
  const cases = JSON.parse(readFileSync(file, "utf8"));
  const claims = cases.map(({ want, ...claim }) => claim);
  const results = await verifyClaims(claims, { cwd: root });
  let worstWrong = 0;
  let rightAtBar = 0;
  for (const [i, r] of results.entries()) {
    const want = [cases[i].want].flat();
    const pick = r.engine?.choice;
    const line = pick === undefined ? undefined : pick === "none" ? null : Number(pick.slice(1));
    const ok = line !== undefined && want.includes(line);
    const conf = r.engine?.confidence ?? 0;
    if (line !== undefined && !ok) worstWrong = Math.max(worstWrong, conf);
    if (ok && conf >= ACT_CONFIDENCE) rightAtBar++;
    console.log(`${r.id}\twant ${want.join("|")}\tpick ${pick ?? "-"}\t${conf}\t${ok ? "ok" : "WRONG"}`);
  }
  console.log(`model ${ENGINE_MODEL} · bar ${ACT_CONFIDENCE} · right at or above bar ${rightAtBar} · highest wrong ${worstWrong}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  if (process.argv[2] === "--probe") {
    await probe(process.argv[3], root);
    process.exit(0);
  }
  let claims;
  try {
    const input = readFileSync(0, "utf8");
    claims = process.argv[2] === "--lines" ? parseClaimLines(input) : JSON.parse(input);
    if (!Array.isArray(claims) || !claims.length) throw new Error("expected a JSON array or claim lines");
  } catch (e) {
    console.error(`verify-claims: unreadable input — ${e.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(await verifyClaims(claims, { cwd: root }), null, 1));
}
