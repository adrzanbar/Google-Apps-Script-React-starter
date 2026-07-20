# Google Apps Script + React Starter

A starter template for building Google Apps Script web apps with a modern React front-end. Write your UI in React with TypeScript, Tailwind CSS, and shadcn — deploy to GAS with one command.

## What's included

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS v4** + **shadcn UI** (radix-nova style)
- **TanStack Query** for server-side data fetching
- **React Router** (MemoryRouter — works inside the GAS sandbox iframe)
- **React Compiler** via `@rolldown/plugin-babel`
- **`vite-plugin-singlefile`** — inlines all JS/CSS into one HTML file for `HtmlService`
- **`esbuild`** — compiles `server/*.ts` → `dist/*.gs` for the GAS V8 runtime
- **clasp** — push to Google Apps Script from the CLI

## Quick start

```sh
# 1. Clone and install
git clone https://github.com/adrzanbar/Google-Apps-Script-React-starter.git my-project
cd my-project
npm install

# 2. Set up clasp (first time only)
clasp login
npm run create -- --title "My Project"

# 3. Develop locally
npm run dev

# 4. Build and deploy
npm run push
```

After `npm run push`, deploy the web app from the [Apps Script editor](https://script.google.com) — or use `clasp deploy` / `clasp open`.

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -p tsconfig.server.json --noEmit && tsc -p tsconfig.app.json --noEmit && vite build && cp server/appsscript.json dist/ && npx esbuild server/*.ts --outdir=dist --out-extension:.js=.gs` |
| `npm run push` | `npm run build && clasp push -f` — build then deploy to GAS |
| `npm run lint` | `eslint .` |
| `npm run preview` | Serve production build locally |
| `npm run create` | `clasp create --type standalone --rootDir dist && clasp pull -f && cp dist/appsscript.json server/appsscript.json`; pass `-- --title "..."` for title |

## Project structure

```
├── src/                  # React front-end
│   ├── App.tsx           # Entry point with QueryClient + Router
│   ├── gas.ts            # gsr<T>() — promise wrapper + `declare global` for google.script.run
│   ├── components/ui/    # shadcn components
│   └── lib/utils.ts      # cn() utility
├── server/               # GAS server-side code
│   ├── Code.ts           # doGet(), server functions
│   └── appsscript.json   # GAS manifest (source of truth)
├── dist/                 # Build output (gitignored, pushed to GAS)
│   ├── index.html        # Single-file React app
│   ├── Code.gs           # Compiled server code
│   └── appsscript.json   # Copied manifest
└── vite.config.ts
```

## Calling server functions from React

`src/gas.ts` exports `gsr<T>()` — a promise wrapper around `google.script.run`:

```ts
import { gsr } from './gas'

// In a React component with TanStack Query:
const query = useQuery({
  queryKey: ['ping'],
  queryFn: () => gsr<string>('ping'),
})
```

- Pass the server function **name as a string**, not a reference.
- Works with TanStack Query, `await`, or `.then()`.
- Rejects with a dev-mode error when `google` is undefined (local Vite dev).

Add server functions in `server/Code.ts`:

```ts
function ping(): string {
  return 'pong: ' + new Date().toISOString()
}
```

Then call from the front-end:

```ts
const result = await gsr<string>('ping')
```

> **Note:** `gsr()` returns a Promise, so for TanStack Query always wrap it: `queryFn: () => gsr('fn')` — not `queryFn: gsr('fn')`.

## Adding shadcn components

```sh
npx shadcn add dialog
npx shadcn add dropdown-menu
```

The `@/` path alias resolves to `./src/`. Components go in `src/components/ui/`.

## Build pipeline

1. `tsc -p tsconfig.server.json --noEmit` — type-checks the `server/` GAS code
2. `tsc -p tsconfig.app.json --noEmit` — type-checks the React front-end (build fails on TS errors)
3. `vite build` — compiles React app to `dist/`
4. `vite-plugin-singlefile` — inlines all JS/CSS into `dist/index.html` (single file for `HtmlService`)
5. `cp server/appsscript.json dist/` — copies manifest (build fails if `server/appsscript.json` missing)
6. esbuild — `server/*.ts` compiled to `dist/*.gs` (plain JS for GAS V8 runtime)

Output (`dist/`) contains `appsscript.json`, `index.html`, and one `.gs` per server file.

## TypeScript

Three separate configs, all referenced from the root `tsconfig.json`:

- **`tsconfig.app.json`** — front-end (`src/`), includes `@/` path alias
- **`tsconfig.node.json`** — Vite config (`vite.config.ts`)
- **`tsconfig.server.json`** — server (`server/`), includes `@types/google-apps-script`

Quirks enforced in app and server configs:

- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `erasableSyntaxOnly: true` — no enums, no namespaces, no constructor parameter properties

## Routing in GAS

`MemoryRouter` — works inside the GAS sandbox iframe where hash-based URLs display as `googleusercontent.com` addresses. MemoryRouter gives normal navigation without broken URL display.

## Acknowledgments

- Built on [Vite](https://vite.dev) + [React](https://react.dev)
- UI components from [shadcn](https://ui.shadcn.com) + [Radix](https://radix-ui.com)
- Powered by [clasp](https://github.com/google/clasp)

## License

MIT
