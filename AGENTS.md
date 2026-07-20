# AGENTS

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -p tsconfig.server.json --noEmit && tsc -p tsconfig.app.json --noEmit && vite build && cp server/appsscript.json dist/ && npx esbuild server/*.ts --outdir=dist --out-extension:.js=.gs` |
| `npm run push` | `npm run build && clasp push -f` — build then deploy to GAS |
| `npm run lint` | `eslint .` |
| `npm run preview` | Serve production build locally |
| `npm run create` | `clasp create --type standalone --rootDir dist` (see first-time setup for full workflow) |

## Build pipeline

1. `tsc -p tsconfig.server.json --noEmit` — type-checks the `server/` GAS code
2. `tsc -p tsconfig.app.json --noEmit` — type-checks the React front-end (build fails on TS errors)
3. `vite build` — compiles React app to `dist/`
4. `vite-plugin-singlefile` — inlines all JS/CSS into `dist/index.html` (single file for `HtmlService`)
5. `cp server/appsscript.json dist/` — copies manifest (build fails if `server/appsscript.json` missing)
6. esbuild — `server/*.ts` compiled to `dist/*.gs` (plain JS for GAS V8 runtime)

Output (`dist/`) contains `appsscript.json`, `index.html`, and one `.gs` per server file.

## First-time setup

1. `clasp login`
2. `npm run create -- --title "My Project"` — creates remote GAS project in `dist/`
3. `clasp pull -f && cp dist/appsscript.json server/appsscript.json` — pull manifest and copy to source
4. Customize `server/appsscript.json` (add libraries, webapp config, etc.) — this is the source of truth, tracked in git
5. `npm run push` — build and deploy

## Project layout

| Path | Purpose |
|------|---------|
| `src/` | React front-end (Vite, tsconfig from `tsconfig.app.json`) |
| `server/` | GAS server-side `.ts` files (compiled to `.gs`), uses `tsconfig.server.json` |
| `dist/` | Build output pushed to GAS via clasp (gitignored) |
| `src/gas.ts` | `gsr<T>()` wrapper + `declare global` for `google.script.run` |
| `src/components/ui/` | shadcn UI components |
| `src/lib/utils.ts` | `cn()` utility (clsx + tailwind-merge) |
| `server/Code.ts` | `doGet()` and server functions |
| `server/appsscript.json` | GAS manifest (source of truth, copied to dist/ during build) |

## Calling server functions from front-end

```ts
import { gsr } from './gas'

// Direct use
const result = await gsr<string>('ping')

// With TanStack Query (wraps in arrow function!)
const query = useQuery({
  queryKey: ['ping'],
  queryFn: () => gsr<string>('ping'),
})
```

- Pass the server function **name as a string**, not a reference.
- `gsr()` returns a Promise. For TanStack Query, always wrap: `queryFn: () => gsr('fn')` — not `queryFn: gsr('fn')`.
- Falls back to rejecting with a dev-mode error when `google` is undefined (local Vite dev).
- Bracket notation on `google.script.run` works fine in GAS V8 runtime — no dispatcher needed.
- **Never expose sensitive IDs (API keys, credentials) to the client.** Read them from `PropertiesService` on the server side.

## Adding a server function

1. Add the function in `server/Code.ts` (or a new `server/*.ts` file — each becomes a `.gs` in `dist/`):
   ```ts
   function ping(): string {
     return 'pong: ' + new Date().toISOString()
   }
   ```
2. Call from front-end: `gsr<string>('ping')`
3. No `.claspignore` changes needed — `!*.gs` catches all server output files.

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
