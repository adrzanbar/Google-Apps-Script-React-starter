# GAS — Vite + React 19 + TypeScript

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | `tsc -b && vite build` (type-check then bundle) |
| `npm run lint` | `eslint .` (flat config, ESLint 10) |
| `npm run preview` | Serve production build locally |

No test framework is configured — there are no tests to run.

## TypeScript quirks

- **`verbatimModuleSyntax: true`** — use `import type` for type-only imports, otherwise it's a build error.
- **`erasableSyntaxOnly: true`** — no enums, no `namespace`, no `constructor` parameter properties.
- Dual tsconfig setup: `tsconfig.app.json` (src/) + `tsconfig.node.json` (vite.config.ts), rooted by `tsconfig.json` via project references.

## React Compiler

Enabled via `@rolldown/plugin-babel` with `reactCompilerPreset` in `vite.config.ts`. Not the native SWC approach. This slows Vite dev/build.

## ESLint

Flat config (`eslint.config.js`). Uses `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. Run with `eslint .` (no args needed).

## Notable dependencies

- React 19, React DOM 19
- Vite 8, `@vitejs/plugin-react` 6
- TypeScript 6
- Babel with `babel-plugin-react-compiler` (React Compiler)
- Rolldown (`@rolldown/plugin-babel`) as the Babel integration layer for Vite
