---
name: test-hygiene
description: Find and remove fake tests (they can't fail, test a mock, or copy the code's own text) and duplicate tests, without losing real coverage. Use when asked to clean up, trim or audit tests, when a suite feels slow or noisy, and before adding a test that may already exist.
---

# Test hygiene

A test is worth keeping only if it fails when the behaviour breaks (AGENTS.md, Tests). Tests that can't fail, or repeat another test, cost time on every run and hide the ones that matter.

## Fake tests: remove or rewrite

A test is fake when breaking the code it names would not turn it red:

- **No real assertion:** asserts a value the test just set, only calls the code, or only checks nothing threw when a throw is impossible.
- **Testing the stub:** the assertion is about what a stub in `tests/unit/stubs` or the mock was set up to return.
- **Copying the source:** reads a file and checks its text is there when the behaviour could be run instead.
- **Restating a constant:** asserts a default equals the literal it was defined as.
- **Skipped or empty:** `skip` with no reason, a commented-out body, a loop over an empty list.

Rewrite it to run the behaviour, or delete it.

## Duplicate tests: merge or remove

- Same setup and assertion under two names.
- A narrow test fully covered by a broader one that fails the same way (keep the narrow one only if its failure is much clearer).
- The same check once per language or view where one table-driven test says it all.
- A browser test of logic a unit test already proves. Keep one E2E per user-visible flow.

## Procedure

1. List the tests and group them by claim: `git grep -n -E "^test\(|  test\(|def test_"`. Read before judging.
2. For each suspect, **break the code on purpose** (comment out the guarded line, flip the condition), run just that test, then put the code back. Still green: it's fake.
3. Before deleting, check why it exists: `git log -S"<test name>" --oneline`. A test added with a bug fix guards that bug; keep or improve it.
4. Delete or merge, one concern per commit.
5. Run everything and compare with before: `npm run typecheck`, `npm run test:unit`, `npm run test:backend`, and `npm run test:e2e` if you touched browser tests.
6. Break the covered code once more and confirm *some* test still goes red.

## Report

List what you removed, which rule it broke, and what still covers the behaviour; what you kept on purpose and why; and the test counts before and after.

## This repository

- `tests/unit/i18n.test.mjs` already proves every language has every key and renders; don't add a per-language test for one string.
- `devtools/mock/e2e/regressions.spec.ts` holds bug regressions: keep each one unless a stronger test covers the same bug.
- `smoke.spec.ts` only checks the plugin loads; don't add more "renders" tests next to it.
