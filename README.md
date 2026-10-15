# Pendulum Simulation

A pendulum simulated on a Node.js server, drawn and controlled from a React web app. You can start, pause and stop it, and change its starting angle, string length and mass.

## Quick start

You need Node 22 (see `.nvmrc`).

```bash
npm install
npm start
```

Then open http://localhost:5173. `npm start` runs 5 pendulum servers and the web app. Ctrl+C stops them all.

To run another number of pendulums (1 to 10), start with `PENDULUM_COUNT=3 npm start`. Pendulum `id` listens on port `3000 + id`, so pendulum 1 is on 3001.

To run one server alone, use `PENDULUM_ID=3 npm run dev --workspace server`.

The browser only talks to the web app's own address. Vite forwards `/api/{id}/...` to pendulum `id`, so `/api/3/state` reaches `http://localhost:3003/state`.

## Scripts

Run them from the root.

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm start`         | Runs all pendulum servers and the web app           |
| `npm test`          | Runs all server and web tests                       |
| `npm run test:ui`   | Opens the test results in the browser               |
| `npm run lint`      | Checks the code with ESLint                         |
| `npm run format`    | Formats the code with Prettier                      |
| `npm run typecheck` | Checks the server and launcher types                |
| `npm run build`     | Builds the web app (this also checks the web types) |

## Architecture

```
┌──────────────────────┐   GET /state every 50 ms   ┌──────────────────────┐
│  web (React)         │ ─────────────────────────► │  server (Express)    │
│  draws the pendulum  │   POST /start /pause ...   │  runs the pendulum   │
│  sends commands      │ ◄───────────────────────── │  60 steps per second │
└──────────────────────┘        ServerState         └──────────────────────┘
```

The server owns the pendulum. It moves it 60 times per second and answers with its current state. The web app never computes physics: it asks for the state every 50 ms, draws it, and sends commands when you click.

```
server/src
  physics/      step(): moves the pendulum by one time step (pure function)
  simulation/   createSimulation(): start, pause, stop, config, and the timer
  api/          createApp() and the HTTP routes, with input validation
web/src
  api/          axios client and one function per route
  hooks/        useSimulation(): polling, commands, connection status, errors
  components/   controls (buttons, sliders, badges) and the pendulum drawing
shared/
  types.ts      types used by both apps (Status, PendulumConfig, ServerState)
```

### API

Every successful call returns the full state: `{ status, config, angle, velocity }`. Errors return `{ error: "message" }`.

| Route          | What it does                         | Errors                                        |
| -------------- | ------------------------------------ | --------------------------------------------- |
| `GET /state`   | Returns the current state            |                                               |
| `POST /start`  | Starts or resumes the pendulum       |                                               |
| `POST /pause`  | Freezes it where it is               |                                               |
| `POST /stop`   | Stops it and resets it to its start  |                                               |
| `POST /config` | Changes `angleDeg`, `length`, `mass` | 400 if a value is invalid, 409 if not stopped |

Allowed values: angle from -90 to 90 degrees, length from 0.5 to 3 m, mass from 0.5 to 5 kg.

## Technologies and why

| Area    | Tool                | Why                                                                                                 |
| ------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| Both    | TypeScript          | Types are shared between the two apps, so a change in the API shape breaks the build, not the user. |
| Server  | Express 5           | Small and widely known. Enough for five routes.                                                     |
| Server  | zod                 | Validates request bodies in one place and gives readable error messages.                            |
| Server  | tsx                 | Runs TypeScript directly, with no build step.                                                       |
| Web     | React 19 and Vite   | Standard stack with a fast dev server.                                                              |
| Web     | TanStack Query      | Handles polling, loading and error states, and updates the screen right after a command.            |
| Web     | axios               | One interceptor turns every server error into a readable message, plus a request timeout.           |
| Web     | React Compiler      | Skips re-renders automatically. The state changes 20 times per second, so this matters.             |
| Web     | Tailwind CSS        | Styling next to the markup, no separate CSS files.                                                  |
| Tests   | Vitest              | Reuses the Vite config, runs fast, and has a fake clock for timer tests.                            |
| Tests   | supertest           | Sends real HTTP requests to the Express app without opening a port.                                 |
| Tests   | Testing Library     | Finds elements by role and text, the way a user sees them.                                          |
| Tests   | MSW                 | Fakes the server at the network level, so the real axios code runs in tests.                        |
| Tooling | npm workspaces      | One install and one lockfile for both apps.                                                         |
| Tooling | ESLint and Prettier | Enforce the import rules and one code style.                                                        |
| Tooling | GitHub Actions      | Runs every check on every pull request.                                                             |

## Decisions and trade-offs

- The server is the single source of truth. The web app only draws what the server says, so every client sees the same pendulum.
- Polling every 50 ms instead of WebSockets. It is simpler to build, debug and test, and a lost request is fixed by the next one. The cost is about 20 requests per second per open page, and up to 50 ms of delay.
- Fixed time step of 1/60 s. This formula keeps the swing height stable over time, and the same number of steps always gives the same result, which makes the physics easy to test.
- The config can only change when the pendulum is stopped (409 otherwise). Changing the length mid-swing would make the pendulum jump.
- Mass only changes the size of the drawn ball. In a real pendulum without air resistance, mass does not change the motion.
- `shared/` holds types only, no code. Type imports disappear at build time, so each app stays independent.
- `createSimulation()` and `createApp()` are factories, so tests build a fresh pendulum and app each time, with no shared state.

## Tests

```bash
npm test
```

Each test protects one behavior that would be easy to break without noticing.

Server (`server/src`):

- `physics/physics.test.ts`: after 10 simulated minutes, the pendulum still swings up to its starting angle, so the formula does not gain or lose energy.
- `simulation/simulation.test.ts`: pressing Start twice does not double the speed, pause freezes the pendulum, resume continues from the same spot, and stop resets it.
- `api/routes.test.ts`: a valid config is accepted, invalid values get a 400, and changes while running get a 409.

Web (`web/src`):

- `components/controls/Controls.test.tsx`: the right buttons are enabled for each status.
- `hooks/useSimulation.test.tsx`: the status shows offline when the server is down.
- `App.test.tsx`: the sliders are locked while running and unlocked when stopped, and the pendulum moves on screen while running.

The tests never wait in real time. Timer tests use Vitest's fake clock, and web tests use a fake server (MSW), so the results are the same on every run. Each test was checked by breaking the code it protects and watching it fail.

## Continuous integration

On every pull request and every push to `main`, GitHub Actions installs the packages and runs lint, the format check, the server typecheck, all tests, and the web build. Any failure shows a red check on the pull request.

## Known limitations

- Only one pendulum so far. The five server instances, neighbor monitoring, collision detection and the STOP and RESTART messages are not built yet.
- The pendulum runs about 2% slower than real time. Node timers fire slightly late, and each step always moves by exactly 1/60 s.
- Polling sends about 20 requests per second per open page.
- The state lives in memory. Restarting the server resets the pendulum.
- No wind and no configurable anchor position yet.
- The web app still shows only pendulum 1.
