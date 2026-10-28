# Proof: a Dart Worker on Cloudflare Workers

Open thread 20 of the Skullery rebuild. The question was whether the dynamic part of the new Jaspr site can run on Cloudflare Workers through a thin Dart adapter, given that the Dart tooling for Workers looks unmaintained.

## Result: holds with limits

A Dart Worker runs under `wrangler dev`. `GET /recipe/x` returns `{"id":"x","title":"Proof Recipe"}` from a pure Dart core. The Dart core has no host code, and the adapter is about 50 lines of Dart plus a 10-line JavaScript shim.

**The path that works is b:** `dart compile js` with a small JavaScript shim. It uses only the Dart SDK (`dart:js_interop`) and wrangler, and needs no third-party Dart package.

The limits:

- The adapter does only what this proof needs: one GET route, no request body, no `env` or `ctx`. Everything beyond that is our own interop code to write and maintain. See [Risks](#risks-for-a-real-adapter).
- All numbers come from the local workerd that `wrangler dev` runs. Nothing was deployed, so there is no edge cold start number.

## Paths tried

| Path | Outcome |
|---|---|
| a. `cloudflare_workers` (Dart Edge) from pub.dev | **Fails.** `dart pub get` resolves on Dart 3.13.7, but `dart run edge build cloudflare_workers` fails with 6 compile errors in `js_bindings` 0.1.2+2. That package uses `external static` members on JS interop extensions, which Dart 3 no longer allows. The upstream repo is archived and `js_bindings` is discontinued, so no fix will come. Evidence is in `attempts/a-cloudflare_workers/` (`build-errors.txt`). |
| b. `dart compile js` + JS shim | **Works.** It is in `worker/`. |
| c. `dart compile wasm` + JS shim | Not tried. The brief said to stop at the first path that works. |

## How it is built

```
proof/dart-workers/
  core/                    pure Dart library + dart test (part 1)
    lib/skullery_core.dart   recipeJson(String id) -> JSON string
    test/                    plain `dart test`, no host
  worker/                  adapter and host (part 2)
    bin/worker.dart          maps GET /recipe/<id> to recipeJson, installs globalThis.skulleryFetch
    src/shim.js              imports the dart2js output, exports { fetch } for the Workers module format
    wrangler.toml            main = src/shim.js, minify = true
    scripts/measure.mjs      size and cold start measurement (part 3)
    results/run-2026-10-28.txt   recorded output of the runs and the curl checks
  attempts/a-cloudflare_workers/  the failed path a, kept as evidence
```

The core is the part that stays. `core/test/skullery_core_test.dart` runs on the plain Dart VM with `dart test`, and that test is the proof that the core needs no host. The adapter parses `request.url` with `Uri.parse`, and it answers `GET /recipe/<id>` with 200 and JSON, a non-GET on that route with 405, and any other path with 404.

## Exact commands

From a clone with Dart 3.13.7 on `PATH` and Node 22:

```sh
# Part 1: core
cd proof/dart-workers/core
dart pub get
dart test                 # 2 tests pass

# Part 2: adapter and host
cd ../worker
dart pub get
npm ci                    # installs wrangler 4.154.0 locally into node_modules
npm run build             # dart compile js -O4 -o build/worker.dart.js bin/worker.dart

# Part 3: run and measure
npx wrangler dev --local --port 8787     # shell 1
curl http://localhost:8787/recipe/x      # shell 2 -> {"id":"x","title":"Proof Recipe"}
node scripts/measure.mjs                 # bundle size + timings; starts and stops its own wrangler dev
```

To reproduce path a: `cd attempts/a-cloudflare_workers && dart pub get && dart run edge build cloudflare_workers`.

None of these commands needs a Cloudflare account, a login or a token. Both `wrangler dev --local` and `wrangler deploy --dry-run` run without one. I set `CI=true` and `WRANGLER_SEND_METRICS=false` so wrangler would not prompt or send telemetry.

## Measurements (2026-10-28)

The environment was a linux x64 container with Dart 3.13.7, wrangler 4.154.0 (workerd 1.20261023.1) and Node 22.22.0. The full output is in `worker/results/run-2026-10-28.txt`.

| Measure | Dart Worker | Plain JS baseline (same route, hand-written) |
|---|---|---|
| dart2js output (`-O4`) | 98,225 bytes | – |
| Worker upload (wrangler `--dry-run`, minified) | **88.36 KiB, 29.37 KiB gzip** | 0.22 KiB |
| Top-level evaluation of the bundle (Node V8) | **13–15 ms** | ~1 ms |
| `wrangler dev` start to first 200 | 2.0–2.2 s | 1.9–2.2 s |
| First request after start | 418–439 ms | 372–540 ms |
| Warm request, median of 20 | 6.6–7.6 ms | 6.7–7.1 ms |

How to read these numbers:

- **Cold start:** Dart adds about 13–15 ms of script evaluation per isolate. The `wrangler dev` start time and the first-request time are dominated by wrangler and workerd themselves, and they match the plain JS baseline within noise. Cloudflare's limit is 1 second for global-scope startup ([limits page](https://developers.cloudflare.com/workers/platform/limits/), read 2026-10-28), so the Dart Worker is far below it. A real edge cold start shows only after a deploy, which was out of scope.
- **Size:** about 88 KiB for a "hello" adapter. That is the dart2js runtime plus `dart:convert` and `Uri`, and it will grow with real code. The same limits page lists 64 MiB uncompressed for both Free and Paid plans, with no compressed limit.
- **`-O4`:** the build uses `-O4`, which drops some runtime checks. Building with `-O2` keeps them at 102,971 bytes of output, so a real adapter should probably use `-O2`.

## Versions and maintenance state

Maintenance data was checked on 2026-10-28 on pub.dev, npm and the GitHub repo pages.

**Used by the working path (b):**

| Package / tool | Version | Last release | Dart 3 | State |
|---|---|---|---|---|
| Dart SDK (`dart:js_interop`, `dart compile js`) | 3.13.7 stable | 2026-10-22 | yes | Maintained by the Dart team. `dart:js_interop` is the current, supported JS interop. |
| `test` (dev only, core) | 1.33.0 (latest) | 2026-10-08 | yes (`^3.11.0`) | Maintained (dart-lang/test, ~278 open issues, 23 open PRs). |
| `wrangler` (npm, local devDependency) | 4.154.0, pinned | 2026-10-27 | n/a | Maintained (cloudflare/workers-sdk, 384 open issues, 225 open PRs, releases about weekly). |
| `skullery_core` | local path package | – | yes | Ours. |

No third-party Dart package is used at runtime.

**Tried and dropped (path a):**

| Package | Version | Last release | Dart 3 | State |
|---|---|---|---|---|
| `cloudflare_workers` | 0.0.4+4 | 2023-06-30 | Declares `<3.0.0`. Pub still resolves it on Dart 3, but it does not compile. | **Unmaintained.** Repo invertase/dart_edge was archived on 2026-03-05 ("no longer maintained and is left archived for educational purposes"), with 24 open issues and 6 open PRs. |
| `edge` (Dart Edge CLI) | 0.0.7 | 2023-06-30 | `<3.0.0` | **Discontinued** on pub.dev. Same archived repo. |
| `edge_runtime` | 0.0.4+2 | 2023-05-22 | `<3.0.0` | Same archived repo. |
| `js_bindings` | 0.1.2+2 | 2023-06-13 | Declares `<4.0.0` but fails to compile on Dart 3.13 (the 6 errors above). | **Discontinued**. Its README says "use Typings instead"; 6 open issues. |
| `js` | 0.6.7 resolved (latest 0.7.2) | 2025-02-11 | yes | **Discontinued**, replaced by `dart:js_interop`. |

I could not use the GitHub API from this environment, so the open issue and PR counts were read from the repo pages.

## Risks for a real adapter

- **Routing.** The proof splits `Uri.pathSegments` by hand. A real adapter needs a router, and `shelf_router` has not been tested under dart2js on Workers. `pathSegments` are percent-decoded, so `/recipe/a%2Fb` arrives as the id `a/b`. The router must decide whether that is allowed. Query strings, HEAD and OPTIONS requests, and CORS are all unhandled.
- **Request bodies.** Nothing here reads a body. `request.text()`, `json()` and `formData()` return Promises, so the handler has to become async and return a `JSPromise<Response>` (`dart:js_interop` has `.toDart` and `.toJS` for this). Streaming bodies (`ReadableStream`) need more hand-written bindings. Size limits and content-type checks are also ours to write.
- **Environment bindings.** The shim drops `env` and `ctx`. Every binding (secrets and vars, D1, KV, R2, `ctx.waitUntil`) needs its own extension type in Dart, typed by hand, because no maintained Dart package for Workers exists. That interop layer is the real cost of this path.
- **SQLite and Turso.** Workers have no `dart:io`, no FFI and no sockets in the Dart sense. `package:sqlite3`, `sqflite`, `drift` with a native backend and any `dart:io` HTTP client will not run. The options are:
  - **D1**, through a binding with hand-written interop.
  - **Turso over HTTP**, by calling the Workers `fetch` from Dart through interop, or by importing `@libsql/client/web` in the JS shim and passing it into Dart.

  `package:http`'s default browser client uses XMLHttpRequest, which Workers lack, so it will not work as-is. None of these options was tested.
- **Errors and debugging.** An uncaught Dart exception becomes a workerd 500. `-O4` minifies names, so stack traces need the source map (`build/worker.dart.js.map`) to be readable.
- **Jaspr.** This proof only shows that plain Dart runs on Workers. Jaspr's own server rendering is built on `dart:io` and shelf, so whether any of Jaspr itself runs in a Worker is untested. The plan keeps only the dynamic part on Workers, and that part must stay free of `dart:io`.
- **Path c as fallback.** `dart compile wasm` was not tried. It needs WasmGC in workerd, and its JS glue expects a browser-like loader. Keep it as a fallback, not a plan.

## What was not done, and why

- **Nothing was deployed to Cloudflare** (the brief forbids it). There is no login, token or account id anywhere, and none was needed. Because of this, there is no real edge cold-start or "startup time" figure; those appear only on deploy.
- **Path c was not tried**, because the brief said to stop at the first path that works.
- **No router, request body, binding, D1 or Turso access was built or tested.** These are out of scope for this proof and are listed under Risks.
- **Tools installed:**
  - The machine had no Dart SDK. I downloaded Dart 3.13.7 stable (checksum verified) into the session's temporary scratch directory and put it on `PATH` only for my own commands. No system SDK was installed or changed.
  - `dart pub get` filled the user pub cache (`~/.pub-cache`).
  - wrangler was installed locally into `worker/node_modules` (gitignored), not globally.
  - No global npm or `dart pub global` tools were installed. The Dart Edge CLI was run with `dart run edge`, not activated globally.
