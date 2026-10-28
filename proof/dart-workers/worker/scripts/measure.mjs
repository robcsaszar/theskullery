// Measures the proof Worker locally. Run from worker/ after `npm run build`:
//   node scripts/measure.mjs
// 1. Bundles with `wrangler deploy --dry-run` (no account needed) and reports
//    the upload size, then times the bundle's top-level evaluation and first
//    fetch in Node's V8 (the same engine workerd runs).
// 2. Starts `wrangler dev --local` and reports the time to the first 200 on
//    /recipe/x, the first-request latency and warm latencies.
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, statSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const env = { ...process.env, CI: "true", WRANGLER_SEND_METRICS: "false" };
const url = "http://localhost:8787/recipe/x";

const out = mkdtempSync(join(tmpdir(), "dart-worker-"));
const dry = execFileSync(
  "npx",
  ["wrangler", "deploy", "--dry-run", "--outdir", out],
  { env, encoding: "utf8" },
);
const bundle = join(out, "shim.js");
console.log(dry.match(/Total Upload: .*/)[0]);
console.log(
  `bundle: ${statSync(bundle).size} bytes, gzip -9 ${gzipSync(readFileSync(bundle), { level: 9 }).length} bytes`,
);

let t0 = performance.now();
const mod = await import(pathToFileURL(bundle).href);
const evalMs = performance.now() - t0;
t0 = performance.now();
const res = await mod.default.fetch(new Request(url));
const body = await res.text();
const firstFetchMs = performance.now() - t0;
console.log(`node eval of bundle: ${evalMs.toFixed(1)} ms, first fetch: ${firstFetchMs.toFixed(2)} ms -> ${res.status} ${body}`);

const dev = spawn("npx", ["wrangler", "dev", "--local", "--port", "8787"], {
  env,
  detached: true,
  stdio: "ignore",
});
const start = performance.now();
let first;
for (;;) {
  try {
    const t = performance.now();
    const r = await fetch(url);
    await r.text();
    if (r.ok) {
      first = performance.now() - t;
      break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 50));
}
console.log(`wrangler dev start -> first 200: ${(performance.now() - start).toFixed(0)} ms (first request ${first.toFixed(1)} ms)`);
const warm = [];
for (let i = 0; i < 20; i++) {
  const t = performance.now();
  await (await fetch(url)).text();
  warm.push(performance.now() - t);
}
warm.sort((a, b) => a - b);
console.log(`warm requests (n=20): median ${warm[10].toFixed(1)} ms, max ${warm[19].toFixed(1)} ms`);
process.kill(-dev.pid);
