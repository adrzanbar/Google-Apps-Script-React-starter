# GAS — Vite + React 19 + TypeScript + Google Apps Script

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR (local dev only) |
| `npm run build` | `vite build && mv ... && esbuild` — builds front-end + server for GAS |
| `npm run push` | `npm run build && clasp push` — build then deploy to GAS |
| `npm run lint` | `eslint .` (flat config, ESLint 10) |
| `npm run preview` | Serve production build locally |
| `npm run create` | Interactive GAS project creation |

## Build pipeline

1. **`vite build`** — compiles React app to `dist/`
2. **Inline** — all JS and CSS are inlined into `dist/Index.html` (single file for `HtmlService`)
3. **Server** — `server/*.ts` compiled via esbuild → `dist/*.gs`

Output (`dist/`) contains exactly `Index.html` and one `.gs` per server file.

## Project layout

| Path | Purpose |
|------|---------|
| `src/` | React front-end (Vite project) |
| `server/` | GAS server-side `.ts` files (compiled to `.gs`) |
| `dist/` | Build output — pushed to GAS via clasp |

## Hello World example

- **Server:** `server/Code.ts` exports `helloWorld()` returning a string
- **Client:** `src/App.tsx` calls `google.script.run.helloWorld()` and displays result
- **Dev fallback:** when not in GAS (local Vite), shows a mock response instead

## TypeScript quirks

- **`verbatimModuleSyntax: true`** — use `import type` for type-only imports, otherwise it's a build error.
- **`erasableSyntaxOnly: true`** — no enums, no `namespace`, no `constructor` parameter properties.
- Dual tsconfig setup: `tsconfig.app.json` (src/) + `tsconfig.node.json` (vite.config.ts), rooted by `tsconfig.json` via project references.
- Server code uses `@types/google-apps-script` for GAS API types.

## React Compiler

Enabled via `@rolldown/plugin-babel` with `reactCompilerPreset` in `vite.config.ts`. Not the native SWC approach. This slows Vite dev/build.

## ESLint

Flat config (`eslint.config.js`). Uses `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. Run with `eslint .` (no args needed).

## Google Apps Script setup

- **`@google/clasp`** — CLI for GAS deployment
- **`.clasp.json`** — contains `scriptId` (edit after `clasp create`); gitignored
- **`.claspignore`** — only `dist/` is pushed
- **`npm run push`** — build + push in one step
- **First time:** `clasp login && npm run create` (creates project + `.clasp.json`), then `npm run push`

## Notable dependencies

- React 19, React DOM 19
- Vite 8, `@vitejs/plugin-react` 6
- TypeScript 6
- Babel with `babel-plugin-react-compiler` (React Compiler)
- Rolldown (`@rolldown/plugin-babel`) as the Babel integration layer for Vite
- `esbuild` — compiles server `*.ts` → `*.gs`
- `@google/clasp` — GAS deployment
- `@types/google-apps-script` — GAS runtime types
