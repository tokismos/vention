# Project rules

## Imports and folders

- Use absolute imports with `@/` (points to `web/src/`) for anything outside the current folder: `import { step } from "@/domain"`. Never use `../`.
- Use `./` only for files in the same folder (inside `index.ts`, or e.g. `ConfigPanel` importing `./Slider`).
- The `@/` alias is set in two places that must stay in sync: `paths` in `web/tsconfig.app.json` and `resolve.alias` in `web/vite.config.ts`.
- Group related files in a folder (e.g. `components/controls/`, `components/pendulum/`).
- Every folder has an `index.ts` that re-exports its public parts. Parent folders re-export their subfolders (e.g. `components/index.ts` does `export * from "./controls"`).
- Import from the folder, not the file: `import { Controls } from "@/components"`, not `"@/components/controls/Controls"`.
- Files used only inside their folder (e.g. `Slider`) are not exported from its `index.ts`.
