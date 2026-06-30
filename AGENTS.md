# AGENTS

Reference for AI agents and contributors working on this project.

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

1. `vite build` — compiles React app to `dist/`
2. `vite-plugin-singlefile` — inlines all JS/CSS into `dist/index.html` (single file for `HtmlService`)
3. Server — `server/*.ts` compiled via esbuild to `dist/*.gs` (plain JS for GAS V8 runtime)
4. Manifest — `server/appsscript.json` copied to `dist/`

Output (`dist/`) contains only `appsscript.json`, `index.html`, and one `.gs` per server file.

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
| `server/appsscript.json` | GAS manifest (source of truth, copied to dist/) |

## Calling server functions from front-end

```ts
import { gsr } from './gas'

// Direct use
const result = await gsr<string>('hello')

// With TanStack Query (wraps in arrow function!)
const query = useQuery({
  queryKey: ['hello'],
  queryFn: () => gsr<string>('hello'),
})
```

- Pass the server function **name as a string**, not a reference.
- `gsr()` returns a Promise. For TanStack Query, always wrap: `queryFn: () => gsr('fn')` — not `queryFn: gsr('fn')`.
- Falls back to rejecting with a dev-mode error when `google` is undefined (local Vite dev).
- Bracket notation on `google.script.run` works fine in GAS V8 runtime — no dispatcher needed.

## Adding a server function

1. Add the function in `server/Code.ts` (or a new `server/*.ts` file — each becomes a `.gs`):
   ```ts
   function myFunction(arg: string): string {
     return `You said: ${arg}`
   }
   ```
2. Call from front-end: `gsr<string>('myFunction', 'hello')`
3. If creating a new server file (e.g. `server/Utils.ts` → `dist/Utils.gs`), add `!Utils.gs` to `.claspignore`. Pattern negation does not support wildcards in the positive direction.

## TypeScript

- `verbatimModuleSyntax: true` — use `import type` for type-only imports or build fails.
- `erasableSyntaxOnly: true` — no enums, no `namespace`, no constructor parameter properties.
- Three tsconfig files: `tsconfig.app.json` (src/), `tsconfig.node.json` (vite.config.ts), `tsconfig.server.json` (server/).
- `@/` path alias resolves to `./src/` (configured in `tsconfig.app.json` and `vite.config.ts`).

## GAS / clasp

- `clasp push -f` is mandatory — clasp 3.3.0 skips push without `-f`.
- `rootDir: "dist"` in `.clasp.json` — clasp reads from `dist/`; `.claspignore` patterns are relative to `rootDir`.
- `.clasp.json` is gitignored — each dev runs `clasp login && npm run create` to set up.
- Root `appsscript.json` is gitignored — source of truth is `server/appsscript.json`, copied during build.
- Web app behavior comes from `appsscript.json` manifest (`webapp` section), not from `clasp create --type`.
- `doGet()` serves `HtmlService.createHtmlOutputFromFile('index')` — lowercase, matching Vite output.
- `clasp create` does not support `--type webapp` — use `--type standalone` and set webapp in manifest.

## Routing

Use `MemoryRouter` — not `HashRouter`. The GAS sandbox iframe makes hash URLs invisible and shows `googleusercontent.com` addresses. MemoryRouter gives the same navigation without broken URL display.

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
