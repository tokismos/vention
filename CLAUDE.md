# Project rules

## Code style

- Never add comments in code. Names and small functions should explain the code.
- A function with two or more parameters takes one object instead, so every call names its values: `createSimulation({ id: 3 })`, `step({ state, length, dt })`. A function with one obvious parameter keeps it plain: `loadConfig(process.env)`, `sendCommand("start")`.
- The type of that object follows the Types rules: exported next to the function when it describes the function's input (`SimulationOptions`, `StepInput`), written inline when the function is used in only one file.

## Imports

- Use alias imports with `@/` (points to the app's own `src/`: `web/src/` or `server/src/`) for anything outside the current folder: `import { step } from "@/physics"`. Never use `../`.
- Use `./` only for files in the same folder (inside `index.ts`, or e.g. `ConfigPanel` importing `./Slider`).
- In `web/`, the `@/` alias is set in two places that must stay in sync: `paths` in `web/tsconfig.app.json` and `resolve.alias` in `web/vite.config.ts`.
- In `server/`, the `@/` alias is set in two places that must stay in sync: `paths` in `server/tsconfig.json` (`tsx` reads it) and `resolve.alias` in `server/vitest.config.ts`.

## Folders

- Group related files in a folder (e.g. `components/controls/`, `components/pendulum/`).
- Every folder has an `index.ts` that re-exports its public parts. Parent folders re-export their subfolders (e.g. `components/index.ts` does `export * from "./controls"`).
- Import from the folder, not the file: `import { Controls } from "@/components"`, not `"@/components/controls/Controls"`.
- Files used only inside their folder (e.g. `Slider`) are not exported from its `index.ts`.

## Types

- A type used by only one file stays in that file.
- A type that describes a function's input or output stays next to that function and is exported with it (e.g. `Command` with `sendCommand` in `api/`, `Simulation` with `createSimulation`).
- Any other type used by several files of one app goes in that app's `types/` folder (e.g. `web/src/types/connection.ts`). Never import a type from a hook or component file.
- Types used by both `web/` and `server/` live once in `shared/types.ts`. Never copy a type between the two apps.
- Import shared types with `import type { Status } from "@shared"`. Always `import type`.
- `shared/` holds types only, no values or functions. Type imports are removed at build time, so Vite never loads files outside `web/`. That is why `@shared` is only in the `paths` of `web/tsconfig.app.json` and `server/tsconfig.json`, not in `vite.config.ts`.

## React

- Destructure what a hook returns: `const { status, start } = useSimulation()`, not `const sim = useSimulation()`.

## Pull requests

- Never run any git or `gh` command that changes something (add, commit, branch, checkout, merge, push, opening or merging a PR). The user is responsible for all of them. Only suggest the commands and the texts (titles, descriptions). Read-only commands like `git status`, `git diff` and `git log` are fine.
- PR titles and commit titles follow Conventional Commits: `type(scope): what it does`.
  - `type`: `feat` (new for the user), `fix` (repairs something broken), `refactor` (same behavior, better code), `test`, `chore` (tooling), `ci`, `docs`.
  - `scope`: `web` or `server` when only one app changes. No scope when both change: `feat: add wind to the simulation`.
  - Imperative mood ("add", not "added"), under about 60 characters, no period at the end.
- Branch names: `type/short-name` with the same type as the title, e.g. `test/web-tests`, `fix/validation-error-format`.
- PR descriptions are concise, with three parts:
  - `Why`: the problem, in one or two sentences.
  - `What changed`: one short line per change.
  - `How to test`: the steps or command that shows it works.
- Merge with "Create a merge commit", not squash or rebase, so stacked PRs keep their original commits.
