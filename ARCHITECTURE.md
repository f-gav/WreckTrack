# WreckTrack architecture

WreckTrack remains a framework-free, local-first static application.

## Source of truth

Do not hand-edit generated application code inside `dist/index.html` or `dist/assets/app.*`.

- `src/index.html` — HTML shell/template.
- `src/styles/app.css` — application stylesheet.
- `src/app-parts.json` — deterministic runtime concatenation order.
- `src/ui/core.js` — small shared UI helpers.
- `src/ui/markdown.js` — shared Markdown rendering/editing helpers.
- `src/state.js` — archive schema and normalization.
- `src/storage.js` — local persistence and mutation scheduling.
- `src/cloud-sync.js` — Supabase auth, merge and cloud synchronization.
- `src/features/tokenator.js` — Tokenator state/rendering/image processing/export.
- `src/features/tokenator-events.js` — Tokenator input and pointer event wiring.
- `src/features/bestiary.js` — Bestiary display, search, filters, sorting and main page rendering.
- `src/features/bestiary-editor.js` — Bestiary editor, tags, import/export and Long Story Short import.
- `src/features/journal.js` — Journal editor state, Markdown live preview, folding and search.
- `src/features/rooms.js` — room list, entry lifecycle and membership UI.
- `src/features/combat.js` — initiative rendering, turn flow, HP and battle-note preview.
- `src/features/detail.js` — creature detail dialog, Markdown content and section navigation.
- `src/features/data.js` — full archive backup, preview and restore.
- `src/app.js` — remaining application bootstrap, feature UI and event wiring.
- `src/service-worker.js` — service-worker template.
- `scripts/build.mjs` — deterministic build into `dist`.
- `tests/` — regression coverage against source files.
- `dist/` — deploy output plus static binary assets.

The architecture migration intentionally preserves one browser script/runtime scope for now. The build concatenates source parts in `app-parts.json`, which lets us extract responsibilities gradually without changing global initialization order or introducing import/export regressions.

## Build

```bash
npm ci
npm run check
```

The build concatenates source parts in declared order, writes content-hashed CSS/JS assets, and injects their names into `dist/index.html` and the service worker.

## Architecture stage 2

Completed extractions:

1. shared UI helpers;
2. shared Markdown helpers;
3. schema/state normalization;
4. local storage;
5. cloud/auth synchronization;
6. Settings feature core;
7. Tokenator feature core;
8. Bestiary display/search core;
9. Bestiary editor/import/export layer;
10. Journal editor core;
11. room management core;
12. combat feature core.
13. full archive backup and restore core.
14. creature detail card core.
15. Tokenator event wiring.

Next safe extractions:

1. remaining application bootstrap/event wiring;
2. consolidate historical function wrappers in focused follow-up patches.

Each extraction must keep storage keys, cloud merge semantics and visible behavior unchanged, and must pass the full regression/build pipeline before merge.
