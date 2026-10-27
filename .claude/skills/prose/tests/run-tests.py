#!/usr/bin/env python3
"""Golden-file tests for slop-scan.py.

Each case in cases.json runs the scanner over a fixture with a channel and
optional --allow flags, then compares stdout and exit code against a recorded
golden in fixtures/<id>.expected.

The point of the corpus is precision, not coverage. clean-blog.md and the
lower half of noun-stack.md exist so that a rule which starts flagging
ordinary prose fails here instead of in someone's draft.

Usage:
    run-tests.py            run every case
    run-tests.py --update   rewrite the goldens from current behaviour
    run-tests.py --filter noun   run only cases whose id contains 'noun'

Exit codes: 0 all passed, 1 one or more failed.
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
FIXTURES = HERE / "fixtures"
SCANNER = HERE.parent / "scripts" / "slop-scan.py"
CASES = HERE / "cases.json"


def run_case(case):
    """Run one case. Returns (actual_text, exit_code)."""
    cmd = [sys.executable, str(SCANNER), "--channel", case["channel"]]
    for rule in case.get("allow", []):
        cmd += ["--allow", rule]
    cmd.append(str(FIXTURES / case["fixture"]))
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.stderr.strip():
        raise RuntimeError(f"{case['id']}: scanner wrote to stderr:\n{proc.stderr}")
    # Strip the absolute fixture path so goldens are portable.
    text = proc.stdout.replace(str(FIXTURES) + "/", "")
    return text, proc.returncode


def golden_path(case):
    return FIXTURES / f"{case['id']}.expected"


def format_golden(text, code):
    return f"{text}exit={code}\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--update", action="store_true",
                    help="rewrite goldens from current behaviour")
    ap.add_argument("--filter", default="", metavar="SUBSTRING",
                    help="run only cases whose id contains SUBSTRING")
    args = ap.parse_args()

    cases = json.loads(CASES.read_text(encoding="utf-8"))
    if args.filter:
        cases = [c for c in cases if args.filter in c["id"]]
        if not cases:
            print(f"no case id contains {args.filter!r}")
            return 1

    failed = []
    for case in cases:
        text, code = run_case(case)
        actual = format_golden(text, code)
        path = golden_path(case)

        if args.update:
            path.write_text(actual, encoding="utf-8")
            print(f"updated  {case['id']}")
            continue

        if not path.exists():
            failed.append(case["id"])
            print(f"MISSING  {case['id']} — no golden; run with --update")
            continue

        expected = path.read_text(encoding="utf-8")
        if actual == expected:
            print(f"ok       {case['id']}")
        else:
            failed.append(case["id"])
            print(f"FAIL     {case['id']}")
            print(f"         {case['asserts']}")
            for line in unified(expected, actual):
                print(f"         {line}")

    if args.update:
        print(f"\n{len(cases)} golden(s) written")
        return 0

    print(f"\n{len(cases) - len(failed)}/{len(cases)} passed")
    if failed:
        print(f"failed: {', '.join(failed)}")
        return 1
    return 0


def unified(expected, actual):
    import difflib
    return list(difflib.unified_diff(
        expected.splitlines(), actual.splitlines(),
        fromfile="expected", tofile="actual", lineterm="", n=1))


if __name__ == "__main__":
    sys.exit(main())
