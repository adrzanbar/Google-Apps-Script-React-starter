# GAS — Vite + React 19 + TypeScript + Google Apps Script

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `vite build && cp server/appsscript.json dist/ && npx esbuild server/*.ts --outdir=dist --out-extension:.js=.gs` |
| `npm run push` | `npm run build && clasp push -f` — build then deploy to GAS |
| `npm run lint` | `eslint .` |
| `npm run preview` | Serve production build locally |
| `npm run create` | `clasp create --type standalone --rootDir dist`; pass `-- --title "..."` for title |

## Build pipeline

1. **`vite build`** — compiles React app to `dist/`
2. **`vite-plugin-singlefile`** — inlines all JS/CSS into `dist/index.html` (single file for `HtmlService`)
3. **Server** — `server/*.ts` compiled via esbuild → `dist/*.gs`. Run through `@types/google-apps-script`, output is plain JS for GAS V8 runtime.
4. **Manifest** — `server/appsscript.json` copied to `dist/` (not the root clasp default)

Output (`dist/`) contains only `appsscript.json`, `index.html`, and one `.gs` per server file.

## Project layout

| Path | Purpose |
|------|---------|
| `src/` | React front-end (Vite project, dual tsconfig with `tsconfig.app.json`) |
| `server/` | GAS server-side `.ts` files (compiled to `.gs`), uses `tsconfig.server.json` |
| `dist/` | Build output — pushed to GAS via clasp |

## Calling server functions from front-end

`src/gas.ts` exports `gsr<T>(fn: string, ...args: unknown[]): Promise<T>` — a promise wrapper around `google.script.run`.

```ts
const result = await gsr<string>('helloWorld')
```

- Pass the server function **name as a string**, not a reference.
- Falls back to rejecting with a dev-mode error when `google` is undefined (local Vite).
- `src/gas.d.ts` provides the `google.script.run` type declarations.

## TypeScript quirks

- **`verbatimModuleSyntax: true`** — use `import type` for type-only imports or it's a build error.
- **`erasableSyntaxOnly: true`** — no enums, no `namespace`, no `constructor` parameter properties.
- Three tsconfig files referenced from root `tsconfig.json`: `tsconfig.app.json` (src/), `tsconfig.node.json` (vite.config.ts), `tsconfig.server.json` (server/).

## Google Apps Script / clasp quirks

- **`clasp push -f` is mandatory** — clasp 3.3.0 skips push without `-f` ("Skipping push").
- **`rootDir: "dist"`** in `.clasp.json` — clasp reads from `dist/`; `.claspignore` patterns are relative to `rootDir`.
- **`.claspignore`** allows only `appsscript.json`, `Code.gs`, `index.html` (relative to `dist/`).
- **`.clasp.json` is gitignored** — each dev runs `clasp login && npm run create` to set up.
- **Root `appsscript.json` is gitignored** — the source of truth is `server/appsscript.json`, copied during build.
- **Web app behavior** comes from `appsscript.json` manifest (`webapp` section), not from `clasp create --type` (which only accepts `standalone`, `sheets`, `docs`, etc.).
- **`doGet()`** in `server/Code.ts` serves `HtmlService.createHtmlOutputFromFile('index')` — lowercase, matching Vite's output.

## React Compiler

Enabled via `@rolldown/plugin-babel` with `reactCompilerPreset` (in addition to `@vitejs/plugin-react` for HMR). This slows Vite dev/build.

## ESLint

Flat config (`eslint.config.js`). `globalIgnores(['dist', 'server'])` — server code is excluded because it uses GAS runtime (no imports, no module system).

## shadcn UI

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (not PostCSS-based v3 config).
- **Style**: `radix-nova` (shadcn v4 default), config in `components.json`.
- **`@/` path alias** resolves to `./src/` (configured in both `tsconfig.app.json` and `vite.config.ts`).
- **Components** in `src/components/ui/`. Utility `cn()` from `src/lib/utils.ts` using `clsx` + `tailwind-merge`.
- Add new components with `npx shadcn add button` (no `--` prefix needed).

## Notable dependencies

- React 19, Vite 8, TypeScript 6
- `@vitejs/plugin-react` 6 + `@rolldown/plugin-babel` (not SWC)
- `vite-plugin-singlefile` — inlines all assets into one HTML
- `esbuild` — compiles server `*.ts` → `*.gs`
- `@google/clasp` 3.3.0 — GAS CLI
- `@types/google-apps-script` — GAS runtime types
