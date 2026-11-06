import { test } from "node:test";
import assert from "node:assert/strict";
import { calls } from "@decky/api";

// A fresh copy of settings.ts per case (its state is module-level).
let n = 0;
async function load(saved) {
  calls.length = 0;
  globalThis.backend = { get_settings: async () => saved, set_settings: async () => true };
  const mod = await import(`../../src/settings.ts?case=${n++}`);
  await mod.initSettings();
  return mod;
}
const saves = () => calls.filter(([name]) => name === "set_settings").map(([, s]) => s);

test("no saved file: defaults, nothing written", async () => {
  const m = await load(null);
  assert.equal(m.settingsLoaded(), true);
  assert.equal(m.getSettings().aLaunches, false, "Ⓐ opens the game page by default");
  assert.equal(m.getSettings().settingsVersion, 7);
  assert.deepEqual(saves(), []);
});

test("old save (v3): every later migration applied once, then saved", async () => {
  const m = await load({ settingsVersion: 3, rawPadApi: false, hapticLevel: 5, heroScale: 105, stepDegrees: 30, ownerText: "mine" });
  const s = m.getSettings();
  assert.equal(s.rawPadApi, true, "v4: circle input back on");
  assert.equal(s.stepDegrees, 40, "v5: tuned step");
  assert.equal(s.hapticLevel, 7, "v6: old default strength moved");
  assert.equal(s.heroScale, 95, "v7: old default hero size moved");
  assert.equal(s.settingsVersion, 7);
  assert.equal(s.ownerText, "mine", "user values kept");
  assert.equal(saves().length, 1);
});

test("v5 save: only v6/v7 run, and only on values still at the old default", async () => {
  const m = await load({ settingsVersion: 5, rawPadApi: false, stepDegrees: 30, hapticLevel: 3, heroScale: 105 });
  const s = m.getSettings();
  assert.equal(s.rawPadApi, false, "v4 not re-run");
  assert.equal(s.stepDegrees, 30, "v5 not re-run");
  assert.equal(s.hapticLevel, 3, "a chosen strength is kept");
  assert.equal(s.heroScale, 95);
});

test("current save: untouched and not rewritten", async () => {
  const m = await load({ settingsVersion: 7, hapticLevel: 5, heroScale: 105 });
  assert.equal(m.getSettings().hapticLevel, 5);
  assert.equal(m.getSettings().heroScale, 105);
  assert.deepEqual(saves(), []);
});

test("legacy library scope becomes a view; removed keys dropped", async () => {
  const m = await load({ installedOnly: false, hideRecentShelf: true });
  const s = m.getSettings();
  assert.equal(s.baseView, "base:all");
  assert.equal("installedOnly" in s, false);
  assert.equal("libraryScope" in s, false);
  assert.equal("hideRecentShelf" in s, false);
});

test("updateSettings: applied at once, written once after the pause", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const m = await load(null);
  m.updateSettings({ ownerText: "a" });
  m.updateSettings({ ownerText: "ab" });
  assert.equal(m.getSettings().ownerText, "ab");
  assert.deepEqual(saves(), [], "debounced");
  t.mock.timers.tick(400);
  assert.equal(saves().length, 1);
  assert.equal(saves()[0].ownerText, "ab");
});

test("wheel position: the shape, the side and where the wheel centre sits", async () => {
  const { placement } = await load(null);
  const { BOTTOM_WHEEL_X: X } = await import("../../src/constants.ts");
  // [position, left pad, wheelXPct] → [layout, wheel on the left half, centre from the left]
  const cases = [
    ["side", false, -1, "side", false, 1],
    ["side", true, -1, "side", true, 0],
    ["opposite", false, -1, "side", true, 0],
    ["opposite", true, -1, "side", false, 1],
    ["bottom", true, -1, "bottom", true, X], // the trackpad's corner
    ["bottom", false, -1, "bottom", false, 1 - X],
    ["top", true, -1, "top", true, X],
    ["center", false, 20, "bottom", false, 0.5], // the slider doesn't move the centred preset
    ["bottom", true, 80, "bottom", false, 0.8], // slid to the right: art and text move left
    ["top", false, 10, "top", true, 0.1],
    ["bottom", false, 50, "bottom", false, 0.5], // dead centre: the trackpad picks the side
    ["bottom", true, 50, "bottom", true, 0.5],
    ["bottom", true, 250, "bottom", false, 1], // out of range: kept on screen
    ["side", false, 30, "side", false, 1], // the slider is only for bottom / top
    ["diagonal", false, -1, "side", false, 1], // a newer build's value
  ];
  for (const [pos, padLeft, pct, layout, flip, wheelX] of cases) {
    assert.deepEqual(placement(pos, padLeft, pct), { layout, flip, wheelX }, `${pos}, ${padLeft ? "left" : "right"} pad, ${pct}`);
  }
});
