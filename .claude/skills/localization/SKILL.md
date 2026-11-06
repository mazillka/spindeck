---
name: localization
description: Keep Spindeck's 10 languages complete and correct - translate new or changed strings into every language, add a new language, and check for gaps, broken placeholders and text left in English or Korean. Use when adding or changing user-facing text, when asked to add a language, translate, check or update localization, or before a release.
---

# Localization

All text lives in `src/lang/<code>.ts`. **Korean (`ko.ts`) is the source**: `Strings` in `src/i18n.ts` is `typeof ko`, so `tsc` fails on any language missing a key or having an extra one. `src/locale.ts` holds `Lang` and `LANGS` (each language's own name and the Steam language names it covers).

| Code | Notes |
| --- | --- |
| `ko` | Source. Polite informal (-요). |
| `en` `de` `fr` `es` `ru` `uk` `ja` `zh` | `zh` is Simplified; Steam's `tchinese` maps to it too. |
| `pt` | Brazilian (`brazilian` and `portuguese` both map here). |

## Changing or adding a string

1. Add or change it in `ko.ts` first, then in every other file at the same position. Never leave English or Korean as a placeholder: typecheck can't tell it from a translation.
2. Reuse an existing string when the same text already exists.
3. Keep every `{placeholder}` and every function argument; word order around it may change.
4. Counts: use the plural helpers in `src/lang/format.ts` (`slavic` for `ru`/`uk`, `hours`), not a sentence that fits only some numbers.
5. Product and button names stay as they are: Spindeck, Steam, Steam Deck, Decky, Decky Loader, GitHub, Ⓐ Ⓑ Ⓧ Ⓨ L1 R1 ≡.
6. Info-line strings stay uppercase where the script has case. Labels must stay short: the Quick Access panel is narrow.
7. Match the file's tone (informal "you" where it already is; polite in `ja`, `ko`).

## Adding a language

1. `src/lang/<code>.ts` translating every key of `ko.ts`.
2. `src/locale.ts`: add the code to `Lang` and a `LANGS` entry (own name + a regex for Steam's language name, e.g. `/^(polish|pl)/i`).
3. `src/i18n.ts`: the import and the `STRINGS` entry.
4. `tests/unit/i18n.test.mjs`: add Steam's name for it to the `langFor` cases.
5. README.md lists the languages: add it there.

A downgrade to a build without the language falls back to auto; never rename or reuse a code.

## Checking

```bash
npm run typecheck
```

```bash
npm run test:unit
```

`i18n.test.mjs` fails on an empty string, `undefined`/`NaN` in a rendered string, a dropped placeholder, or a language in `LANGS` without a translation.

Strings still identical to English in another language (a few such as `OK` or `GitHub` are fine):

```bash
node --import ./tests/unit/register.mjs --input-type=module -e "const {STRINGS}=await import('./src/i18n.ts');const en=STRINGS.en;for(const [l,s] of Object.entries(STRINGS)){if(l==='en')continue;const same=Object.keys(en).filter(k=>typeof en[k]==='string'&&s[k]===en[k]);if(same.length)console.log(l,same.join(', '))}"
```

Then look at the panel in a long language (`de`, `ru`) and in `ja` in the mock (`npm run mock`) for text that overflows.
