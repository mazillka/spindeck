---
name: compatibility
description: Keep Spindeck working for existing users across updates - their saved settings, the self-update path from older releases, and the Steam and Decky versions they run. Use before changing settings keys or defaults, release asset names or tags, the updater, the plugin name, or anything else an installed or older Spindeck depends on.
---

# Backward compatibility

People update from any older release (or never update) and keep their settings. A change is done only when it works for them too, not just for a fresh install.

## What must keep working

| Surface | Where | Rule |
| --- | --- | --- |
| Saved settings | `main.py` stores them; `initSettings()` in `src/settings.ts` merges `DEFAULTS` + the saved file and keeps only keys this version knows | A new key gets a default in `DEFAULTS`. Never rename a key or change what a value means: the next load drops the old key and the user's choice is gone. To change an existing default for saved settings, bump `settingsVersion` and add a `v < N` migration that only moves values still on the old default. |
| Self-update | `src/updater.ts`; `release.yml` | Every older release finds updates by `releases/latest` (stable) or the release list (pre-release), the asset regex `/^spindeck-.*\.zip$/`, GitHub's `sha256:` digest and `DOWNLOAD_PREFIX`. Never rename the asset, drop the digest, change the `vX.Y.Z` / `vX.Y.Z-rc.N` tag scheme, or move the repo without a redirect. |
| Plugin identity | `name` in `plugin.json` and `package.json`, the zip's top folder `spindeck/` (`scripts/package.sh`) | Decky keys a plugin by name and folder. Renaming makes a new plugin: existing installs don't update to it and lose their settings. Needs the user's OK. |
| Steam internals | `games.ts`, `homePatch.tsx`, `WheelPage.tsx` | Not a public API. Wrap every access in try/catch and fall back to Steam's own home (AGENTS.md, Rules). |
| Decky Loader | `@decky/api`, `@decky/ui`, `utilities/install_plugin` | Check a route or API exists in the Decky versions people run (decky-loader's `utilities.py`, `browser.py`) before relying on it. |

## Rules

1. **Old data in, no crash out.** Anything read from disk or the network may come from an older or newer build: coerce it, default it, or skip it.
2. **New behaviour is opt-in.** Defaults stay what users have today unless the user agrees to change them (then it's a `settingsVersion` migration).
3. **Add first, remove later.** To replace something, read the new and fall back to the old, release that, and remove the old only in a later release.

## Checking a change

- `npm run test:unit` (`settings.test.mjs`, `updater.test.mjs`) and `npm run test:backend`. Touching settings: add a case that loads an **old** saved file. Touching the updater: a case with an older release list.
- `npm run typecheck`, then build.
- On a Deck: with the current release installed and some settings changed, install the new build and check the settings are still there. For an updater change, install an older release and let it update itself.
- In the PR, say what an existing user sees after updating. Anything other than "the same, plus the new feature" needs the user's OK first.
