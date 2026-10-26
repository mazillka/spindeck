# AGENTS.md

Notes for coding agents working on Spindeck, a [Decky Loader](https://decky.xyz) plugin that replaces the Steam Deck home screen with a rotary-wheel game launcher. User-facing docs: [README.md](README.md).

## Layout

- `src/` — frontend (TypeScript + React, runs inside Steam's gamepad UI)
  - `index.tsx` plugin entry: routes, home patch, Quick Access panel (all settings UI)
  - `WheelPage.tsx` the wheel: input, roulette, L1/R1 views, hero art
  - `HomeSwitch.tsx` / `homePatch.tsx` wheel vs Steam's original home; patch must stay last on the route
  - `settings.ts` settings model, defaults, migrations (`settingsVersion`)
  - `i18n.ts` English + Korean strings (`ko` is the source type; `en` must match it)
  - `games.ts` library reads from Steam's internal stores (`appStore`, `collectionStore`, `SteamClient`)
  - `updater.ts` in-panel update via GitHub releases + Decky's installer
- `main.py` — Python backend: settings file, update marker, uninstall cleanup
- `dist/index.js` — built bundle, **committed**; rebuild after changing `src/`
- `typecheck/` — offline type stubs for Decky/React
- `tests/` — dev-only browser tests with stubbed Steam/Decky ([tests/README.md](tests/README.md))
- `build/` — offline bun build with shims (no `npm install` needed)

## Commands

```bash
npm run typecheck      # strict TS check against typecheck/ stubs — run after every change
bun build/build.ts     # → dist/index.js
./scripts/package.sh   # → release/spindeck-<version>.zip
python3 tests/py/t.py  # backend tests
```

## Rules

- Steam's UI internals are not a public API. Wrap every access in try/catch and fall back to Steam's own behaviour; never let the home screen crash.
- Anything that changes Steam's DOM, input or styles must be undone on unload: register it with `onTeardown()`.
- New setting: add it to `WheelSettings` + `DEFAULTS` in `settings.ts`, a panel control in `index.tsx`, and both languages in `i18n.ts`. If an existing default changes, add a `settingsVersion` migration.
- Button handlers on the wheel go through the `latest`/`call` trampolines in `WheelPage.tsx` (Steam's `Focusable` keeps stale handlers otherwise). On the Deck: Ⓨ = `Options`, Ⓧ = `Secondary`, ≡ = `Menu`.
- Keep `README.md` and `README.ko.md` in sync (controls table, features).
- Release: bump `package.json` (the build injects it as `PLUGIN_VERSION`), add `## X.Y.Z` to `RELEASE_NOTES.md` and `CHANGELOG.md`, push tag `vX.Y.Z`.
- Match the existing code: comments explain *why* (often what was seen on device), constants live in `src/constants.ts`.
