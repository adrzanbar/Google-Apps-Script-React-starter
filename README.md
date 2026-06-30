# Google Apps Script + React Starter

A starter template for building Google Apps Script web apps with a modern React front-end. Write your UI in React with TypeScript, Tailwind CSS, and shadcn — deploy to GAS with one command.

## What's included

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS v4** + **shadcn UI** (radix-nova style)
- **TanStack Query** for server-side data fetching
- **React Router** (MemoryRouter — works inside the GAS sandbox iframe)
- **React Compiler** via `@rolldown/plugin-babel`
- **GQuery** — Sheets ORM via GAS library (with Sheets advanced service enabled)
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

# 3. Set SPREADSHEET_ID in script properties
#    In the Apps Script editor: Project Settings → Script Properties
#    Add: SPREADSHEET_ID = your-google-sheets-id

# 4. Develop locally
npm run dev

# 5. Build and deploy
npm run push
```

After `npm run push`, deploy the web app from the [Apps Script editor](https://script.google.com) — or use `clasp deploy` / `clasp open`.

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build everything to `dist/` |
| `npm run push` | Build + push to GAS (`clasp push -f`) |
| `npm run create` | Create a new GAS project (`clasp create`) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |

## Project structure

```
├── src/                  # React front-end
│   ├── App.tsx           # Entry point with QueryClient + Router
│   ├── gas.ts            # gsr<T>() — promise wrapper for google.script.run
│   ├── gas.d.ts          # TypeScript declarations for GAS API
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
  queryKey: ['testGQuery'],
  queryFn: () => gsr<string[]>('testGQuery'),
})
```

- Pass the server function **name as a string**, not a reference.
- Works with TanStack Query, `await`, or `.then()`.
- Rejects with a dev-mode error when `google` is undefined (local Vite dev).

Add server functions in `server/Code.ts`:

```ts
function getSheetNames(): string[] {
  const props = PropertiesService.getScriptProperties()
  const id = props.getProperty('SPREADSHEET_ID')
  if (!id) throw new Error('SPREADSHEET_ID not set')
  return SpreadsheetApp.openById(id).getSheets().map(s => s.getName())
}
```

Then call from the front-end:

```ts
const result = await gsr<string[]>('getSheetNames')
```

> **Note:** `gsr()` returns a Promise, so for TanStack Query always wrap it: `queryFn: () => gsr('fn')` — not `queryFn: gsr('fn')`.

## GQuery / Sheets

This project includes [GQuery](https://www.npmjs.com/package/@imreallyliam/gquery) as a GAS library for Sheets operations, backed by the Sheets advanced service.

- Read spreadsheet IDs from `PropertiesService.getScriptProperties()` — never expose them to the client.
- Set `SPREADSHEET_ID` in the Apps Script editor under **Project Settings → Script Properties**.
- Use GQuery as `new GQuery.GQuery(spreadsheetId)` — the first `GQuery` is the library identifier.
- GQuery library versions available in GAS may differ from what's in the manifest. If a push resets the library to a lower version, re-add it via the Apps Script editor (Services → Libraries).

## Adding shadcn components

```sh
npx shadcn add dialog
npx shadcn add dropdown-menu
```

The `@/` path alias resolves to `./src/`. Components go in `src/components/ui/`.

## Build pipeline

```
vite build                →  dist/index.html  (single file, all JS/CSS inlined)
cp server/appsscript.json →  dist/appsscript.json
esbuild server/*.ts → .gs  →  dist/Code.gs
```

Then `clasp push -f` uploads `dist/` to GAS. The `.claspignore` ensures only `appsscript.json`, `Code.gs`, and `index.html` are pushed.

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
- Sheets ORM via [GQuery](https://www.npmjs.com/package/@imreallyliam/gquery)
- Powered by [clasp](https://github.com/google/clasp)

## License

MIT
