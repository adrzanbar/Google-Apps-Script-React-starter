# AGENTS

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `vite build && cp server/appsscript.json dist/ && npx esbuild server/*.ts --outdir=dist --out-extension:.js=.gs` |
| `npm run push` | `npm run build && clasp push -f` — build then deploy to GAS |
| `npm run lint` | `eslint .` |
| `npm run preview` | Serve production build locally |
| `npm run create` | `clasp create --type standalone --rootDir dist` (see first-time setup for full workflow) |

## Build pipeline

1. `vite build` — compiles React app to `dist/`
2. `vite-plugin-singlefile` — inlines all JS/CSS into `dist/index.html` (single file for `HtmlService`)
3. `cp server/appsscript.json dist/` — copies manifest (build fails if `server/appsscript.json` missing)
4. esbuild — `server/*.ts` compiled to `dist/*.gs` (plain JS for GAS V8 runtime)

Output (`dist/`) contains `appsscript.json`, `index.html`, and one `.gs` per server file.

## First-time setup

1. `clasp login`
2. `npm run create -- --title "My Project"` — creates remote GAS project in `dist/`
3. `clasp pull -f && cp dist/appsscript.json server/appsscript.json` — pull manifest and copy to source
4. Customize `server/appsscript.json` (add libraries, webapp config, etc.) — this is the source of truth, tracked in git
5. Set `SPREADSHEET_ID` in Apps Script editor (Project Settings → Script Properties)
6. `npm run push` — build and deploy

## Project layout

| Path | Purpose |
|------|---------|
| `src/` | React front-end (Vite, tsconfig from `tsconfig.app.json`) |
| `server/` | GAS server-side `.ts` files (compiled to `.gs`), uses `tsconfig.server.json` |
| `dist/` | Build output pushed to GAS via clasp (gitignored) |
| `src/gas.ts` | `gsr<T>()` — promise wrapper for `google.script.run` |
| `src/gas.d.ts` | TypeScript declarations for `google.script.run` |
| `src/components/ui/` | shadcn UI components |
| `src/lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) |
| `server/Code.ts` | `doGet()` and server functions |
| `server/appsscript.json` | GAS manifest (source of truth, copied to dist/ during build) |

## Calling server functions from front-end

```ts
import { gsr } from './gas'

// Direct use
const result = await gsr<string[]>('testGQuery')

// With TanStack Query (wraps in arrow function!)
const query = useQuery({
  queryKey: ['testGQuery'],
  queryFn: () => gsr<string[]>('testGQuery'),
})
```

- Pass the server function **name as a string**, not a reference.
- `gsr()` returns a Promise. For TanStack Query, always wrap: `queryFn: () => gsr('fn')` — not `queryFn: gsr('fn')`.
- Falls back to rejecting with a dev-mode error when `google` is undefined (local Vite dev).
- Bracket notation on `google.script.run` works fine in GAS V8 runtime — no dispatcher needed.
- **Never expose sensitive IDs (spreadsheet IDs, library IDs) to the client.** Read them from `PropertiesService` on the server side.

## Adding a server function

1. Add the function in `server/Code.ts` (or a new `server/*.ts` file — each becomes a `.gs` in `dist/`):
   ```ts
   function getSheetNames(): string[] {
     const props = PropertiesService.getScriptProperties()
     const id = props.getProperty('SPREADSHEET_ID')
     if (!id) throw new Error('SPREADSHEET_ID not set')
     return SpreadsheetApp.openById(id).getSheets().map(s => s.getName())
   }
   ```
2. Call from front-end: `gsr<string[]>('getSheetNames')`
3. No `.claspignore` changes needed — `!*.gs` catches all server output files.

## GQuery / Sheets

- **GQuery** is included as a GAS library in `server/appsscript.json` (library ID `1UqTjUrX6rnMMzbYJPJRPk3cmLCYc7n7FZwZq6Q7gG-j3rTqj15LC953B`).
- Use as `new GQuery.GQuery(spreadsheetId)` — the double `GQuery` is because the first is the library identifier.
- **Sheets advanced service** is enabled in the manifest (`serviceId: "sheets"`, version `v4`). Required by GQuery for write operations.
- GQuery library versions available in GAS may differ from what's in the manifest. If a push resets the library to a lower version, re-add it via the Apps Script editor (Services → Libraries).
- Spreadsheet IDs stored in `PropertiesService.getScriptProperties()` under `SPREADSHEET_ID` — set once via the Apps Script editor (Project Settings → Script Properties).

## TypeScript

- `verbatimModuleSyntax: true` — use `import type` for type-only imports or build fails.
- `erasableSyntaxOnly: true` — no enums, no `namespace`, no constructor parameter properties.
- Three tsconfig files: `tsconfig.app.json` (src/), `tsconfig.node.json` (vite.config.ts), `tsconfig.server.json` (server/).
- `@/` path alias resolves to `./src/` (configured in `tsconfig.app.json` and `vite.config.ts`).

## GAS / clasp

- `clasp push -f` is mandatory — clasp 3.3.0 skips push without `-f`.
- `rootDir: "dist"` in `.clasp.json` — clasp reads from `dist/`; `.claspignore` patterns are relative to `rootDir`.
- `.clasp.json` is gitignored — each dev runs `clasp login && npm run create` to set up.
- `/appsscript.json` (root) is gitignored — source of truth is `server/appsscript.json`, copied during build.
- `clasp create` supports `--type webapp` but this project uses `--type standalone` + sets webapp config in the manifest.
- `doGet()` serves `HtmlService.createHtmlOutputFromFile('index')` — lowercase, matching Vite output.
- `.claspignore` uses `!*.gs` so new server files are pushed automatically — no per-file additions needed.

## Routing

`MemoryRouter` — works inside the GAS sandbox iframe (routes navigate without broken `googleusercontent.com` URLs).

## React Compiler

Enabled via `@rolldown/plugin-babel` with `reactCompilerPreset` (in addition to `@vitejs/plugin-react` for HMR). This slows Vite dev/build.

## ESLint

Flat config (`eslint.config.js`). `globalIgnores(['dist', 'server'])` — server code is excluded because it uses GAS runtime (no imports, no module system).

## shadcn UI

- Tailwind CSS v4 via `@tailwindcss/vite` plugin (not PostCSS-based v3 config).
- Style: `radix-nova` (shadcn v4 default), config in `components.json`.
- Add new components: `npx shadcn add button` (no `--` prefix needed).

## Dependencies

- React 19, Vite 8, TypeScript 6
- `@vitejs/plugin-react` 6 + `@rolldown/plugin-babel` (not SWC)
- `vite-plugin-singlefile` — inlines all assets into one HTML
- `esbuild` — compiles server `*.ts` → `*.gs`
- `@google/clasp` 3.3.0 — GAS CLI
- `@types/google-apps-script` — GAS runtime types
- `@tanstack/react-query` — server-side data fetching
- `react-router` — client-side routing (MemoryRouter)
- GQuery — Sheets ORM (GAS library, not npm)
