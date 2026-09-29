# WreckTrack architecture

WreckTrack remains a framework-free, local-first static application.

## Source of truth

Do not hand-edit generated application code inside `dist/index.html` or `dist/assets/app.*`.

- `src/index.html` — HTML shell/template.
- `src/styles/app.css` — transitional application stylesheet.
- `src/app-parts.json` — ordered list of JavaScript source parts used by the concatenating build.
- `src/ui/core.js` — shared DOM/escaping/plural/toast helpers.
- `src/ui/markdown.js` — shared Markdown parsing/rendering helpers.
- `src/state.js` — archive schema versioning, migrations and normalization.
- `src/storage.js` — local archive loading, delayed persistence and mutation tracking.
- `src/app.js` — remaining transitional application JavaScript.
- `src/service-worker.js` — service-worker template.
- `scripts/build.mjs` — deterministic build into `dist`.
- `tests/` — regression coverage against source files.
- `dist/` — deploy output plus static binary assets.

The first architecture stage intentionally extracts the monolith without changing runtime semantics. Feature/module splitting comes after this boundary is stable.

## Build

```bash
npm ci
npm run check
```

The build writes content-hashed CSS/JS assets and injects their names into `dist/index.html` and the service worker.

## Next module split

The next safe order is:

1. ~~pure UI/Markdown utilities~~ — extracted in Architecture Part 2A;
2. ~~schema/state/storage~~ — extracted in Architecture Part 2B;
3. cloud sync;
4. feature modules (Bestiary, Rooms/Combat, Journal, Tokenator, Settings);
5. shared event wiring / application bootstrap.

Each extraction should preserve current data keys, cloud merge semantics and visible behavior, and should be covered by regression tests before deleting the old source block.
