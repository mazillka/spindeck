# Dev tests (not shipped)

| Suite | Where | Run |
| --- | --- | --- |
| Unit: settings migrations, updater (digest / URL checks), library loading, Hangul, odometer, haptics | `tests/unit/` | `npm run test:unit` (Node 24+, nothing to install) |
| Backend: settings file, update marker, uninstall | `tests/py/t.py` | `npm run test:backend` |
| Smoke + E2E: the real plugin and `main.py` in a browser mock | `devtools/mock/e2e/` | `npm run test:e2e`, see [devtools/mock/README.md](../devtools/mock/README.md) |

CI runs all three. The scripts below are older regression checks that need a local React / Playwright install (paths at the top of each file).

## Regression scripts

Live tests that run the built plugin (`dist/index.js`) with real React in headless Chromium,
using stubbed Decky/Steam globals (`entry.js`).

    bun build tests/entry.js --outdir tests/out --format esm --define 'process.env.NODE_ENV="production"'
    cp dist/index.js tests/out/plugin.js   # + an index.html loading entry.js, and optional hero/cap PNGs
    node tests/flow.mjs   # screen switching, Ⓑ, held ▲, wheel ▲ → search
    node tests/stab.mjs   # unload cleanup (without React unmount), crash fallback, unknown layout
    node tests/band.mjs   # top band: Steam bar + tab row, survives React rewrites
    node tests/jank.mjs   # no scroll fighting / style churn while Steam scrolls
    python3 tests/py/t.py # backend: missing/corrupt/non-dict settings, uninstall
    node tests/sgdb.mjs   # another plugin (SteamGridDB) patching the home route first or last: no React #130
    node tests/bottomshot.mjs # bottom layout: custom text just below the hero art away from the wheel, Ⓨ pill right under it (PNG in out/)
    node tests/heropos.mjs  # side layout: hero art v1.3.0 style on/off; the switch shows only for the side layout
    node tests/perf.mjs   # 40 fast D-pad steps: CPU time, hero mounts, style writes

Paths to React/Playwright point at this dev machine's tool installs; adjust as needed.
Typecheck (offline stubs in `typecheck/`):  `npm run typecheck`
