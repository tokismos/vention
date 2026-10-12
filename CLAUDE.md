# Project rules

## Code style

- Never add comments in code. Names and small functions should explain the code.

## Imports and folders

- Use alias imports with `@/` (points to the app's own `src/`: `web/src/` or `server/src/`) for anything outside the current folder: `import { step } from "@/physics"`. Never use `../`.
- Use `./` only for files in the same folder (inside `index.ts`, or e.g. `ConfigPanel` importing `./Slider`).
- In `web/`, the `@/` alias is set in two places that must stay in sync: `paths` in `web/tsconfig.app.json` and `resolve.alias` in `web/vite.config.ts`.
- In `server/`, the `@/` alias is set only in `paths` in `server/tsconfig.json` (`tsx` reads it).

## Shared types

- Types used by both `web/` and `server/` live once in `shared/types.ts`. Never copy a type between the two apps.
- Import them with `import type { Status } from "@shared"`. Always `import type`.
- `shared/` holds types only, no values or functions. Type imports are removed at build time, so Vite never loads files outside `web/`. That is why `@shared` is only in the `paths` of `web/tsconfig.app.json` and `server/tsconfig.json`, not in `vite.config.ts`.
- Group related files in a folder (e.g. `components/controls/`, `components/pendulum/`).
- Every folder has an `index.ts` that re-exports its public parts. Parent folders re-export their subfolders (e.g. `components/index.ts` does `export * from "./controls"`).
- Import from the folder, not the file: `import { Controls } from "@/components"`, not `"@/components/controls/Controls"`.
- Files used only inside their folder (e.g. `Slider`) are not exported from its `index.ts`.

## React

- Destructure what a hook returns: `const { status, start } = useSimulation()`, not `const sim = useSimulation()`.
