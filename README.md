# Pendulum Simulation

A pendulum simulated on a Node.js server, drawn and controlled from a React web app. You can start, pause and stop it, and change its starting angle, string length, mass and anchor position. When two balls touch, every pendulum stops, and they all restart together 5 seconds later.

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
┌──────────────────────┐   POST /start /pause /config   ┌──────────────────────┐
│  web (React)         │ ─────────────────────────────► │  pendulum servers    │
│  draws the pendulums │       (REST, through Vite)     │  one pendulum each   │
│  sends commands      │                                │  60 steps per second │
└──────────┬───────────┘                                └──────────┬───────────┘
           │  presence + state (MQTT over WebSocket)               │  publish on every change
           └─────────────────────►  broker (Aedes)  ◄──────────────┘
```

Each server owns one pendulum, moves it 60 times per second, and publishes its state to the broker on every change. The web app never computes physics: it subscribes to every pendulum's presence and state, draws what arrives, and sends commands with REST when you click.

### Collisions

1. After every step, a server checks its ball against its online neighbors' balls. They collide when the gap between them is 20 cm or less (`COLLISION_GAP`).
2. The server that sees it freezes its pendulum (status `halted`) and sends `system/stop` with the two ids, for example `[2, 3]`.
3. Every server that hears STOP freezes too, keeps the two ids in its state, and answers `system/restart`.
4. Once every online pendulum has sent RESTART, each server waits 5 seconds (`RESTART_DELAY_MS`) and restarts from its starting angle.
5. The page sees the `halted` status and the ids in the state, and shows "Pendulums 2 and 3 collided. Restarting in 5 s." Only Stop works during the halt.

```
server/src
  physics/      step(): moves the pendulum by one time step (pure function), and collides(): do two balls touch
  simulation/   createSimulation(): start, pause, stop, halt, restart, config, and the timer
  barrier/      createRestartBarrier(): waits for every RESTART, then restarts after 5 seconds
  api/          createApp() and the HTTP routes, with input validation
  config/       loadConfig(): reads and checks PENDULUM_ID, PORT, BROKER_URL
  broker/       startBroker(): the MQTT broker (Aedes), TCP 1883 and WebSocket 8888
  bus/          connectBus(): presence, Last Will, the state published on every change, STOP and RESTART, and pause when offline
web/src
  api/          axios client and one function per command route
  bus/          pendulumFeed(): one MQTT connection, a fresh picture of every pendulum per frame
    feed.ts       the wiring: connects, listens, tells React when the picture changes
    snapshot.ts   toSnapshot(): the online pendulums, the offline ids, the overall status and the collision, ready to draw
    overallStatus.ts  overallStatus(): one status for all pendulums, halted first
    brokerUrl.ts  the broker's address: the page's own host + /mqtt
  hooks/        usePendulums(): the live picture of every pendulum, plus start, pause, stop and config
  components/   controls (buttons, sliders, badges, collision banner) and the pendulum drawing
shared/
  types.ts      types used by both apps (Status, PendulumConfig, ServerState, Collision)
  limits.ts     LIMITS, MAX_BALL_RADIUS, COLLISION_GAP and RESTART_DELAY_MS
  topics.ts     the MQTT topic names, including system/stop and system/restart
  liveState.ts  createLiveState(), applyMessage(): who is online and each pendulum's latest state
```

### API

Every successful call returns the full state: `{ id, status, config, angle, velocity, ball, collision }`. `collision` is the two ids that collided while `halted`, otherwise `null`. Errors return `{ error: "message" }`.

| Route          | What it does                                    | Errors                                        |
| -------------- | ----------------------------------------------- | --------------------------------------------- |
| `GET /state`   | Returns the current state                       |                                               |
| `POST /start`  | Starts or resumes, ignored if halted            |                                               |
| `POST /pause`  | Freezes it where it is                          |                                               |
| `POST /stop`   | Stops it and resets it to its start             |                                               |
| `POST /config` | Changes `angleDeg`, `length`, `mass`, `anchorX` | 400 if a value is invalid, 409 if not stopped |

Allowed values: angle from -90 to 90 degrees, length from 0.5 to 3 m, mass from 0.5 to 5 kg, anchor X from 0 to 10 m.

## Technologies and why

| Area    | Tool                | Why                                                                                                 |
| ------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| Both    | TypeScript          | Types are shared between the two apps, so a change in the API shape breaks the build, not the user. |
| Server  | Express 5           | Small and widely known. Enough for five routes.                                                     |
| Server  | zod                 | Validates request bodies in one place and gives readable error messages.                            |
| Server  | tsx                 | Runs TypeScript directly, with no build step.                                                       |
| Web     | React 19 and Vite   | Standard stack with a fast dev server.                                                              |
| Web     | TanStack Query      | Handles commands, their loading and error states.                                                   |
| Web     | axios               | One interceptor turns every server error into a readable message, plus a request timeout.           |
| Web     | React Compiler      | Skips re-renders automatically. The state changes 20 times per second, so this matters.             |
| Web     | Tailwind CSS        | Styling next to the markup, no separate CSS files.                                                  |
| Tests   | Vitest              | Reuses the Vite config, runs fast, and has a fake clock for timer tests.                            |
| Tests   | supertest           | Sends real HTTP requests to the Express app without opening a port.                                 |
| Tests   | Testing Library     | Finds elements by role and text, the way a user sees them.                                          |
| Tooling | npm workspaces      | One install and one lockfile for both apps.                                                         |
| Tooling | ESLint and Prettier | Enforce the import rules and one code style.                                                        |
| Tooling | GitHub Actions      | Runs every check on every pull request.                                                             |

## Decisions and trade-offs

- The server is the single source of truth. The web app only draws what the server says, so every client sees the same pendulum.
- The page reads live state from MQTT and writes with REST. Commands need an answer (400, 409), which MQTT has no built-in way to give, while positions are a stream that MQTT pushes. Polling every pendulum 20 times per second is gone.
- The page redraws at most once per screen frame (`requestAnimationFrame`). About 300 messages arrive per second with 5 pendulums, but the screen only shows about 60 images per second.
- After every (re)connect, the page forgets what it knew and rebuilds from the broker's kept messages. A pendulum that died while the page was disconnected would otherwise stay on screen as a ghost.
- A pendulum with a kept state but no presence crashed (its Last Will cleared the presence), so the page shows it as offline.
- Fail safe: when a server loses the broker, it pauses its pendulum. Without the broker it cannot hear a STOP from its neighbors, so it must not keep swinging blind. It stays paused after reconnecting, and its first message tells the broker it is paused. You press Start to resume.
- Fixed time step of 1/60 s. This formula keeps the swing height stable over time, and the same number of steps always gives the same result, which makes the physics easy to test.
- The config can only change when the pendulum is stopped (409 otherwise). Changing the length mid-swing would make the pendulum jump.
- Mass only changes the size of the drawn ball. In a real pendulum without air resistance, mass does not change the motion.
- `shared/` holds anything both apps use, whatever kind of code it is: today the types, `LIMITS`, the MQTT topic helpers and the live state. Each lives there once and is never copied between the apps.
- `halted` is a separate status from `paused`. Start is ignored while halted, so a click cannot break the group restart. Only Stop works, and it cancels the restart for that pendulum.
- The two collided ids travel inside each pendulum's state, not only in the STOP message. The broker keeps the state, so a page opened during a halt still shows the collision.
- The page counts down 5 seconds from the moment it sees the collision. It does not compare the server's clock with the browser's clock, which can differ.
- `createSimulation()` and `createApp()` are factories, so tests build a fresh pendulum and app each time, with no shared state.

## Tests

```bash
npm test
```

Each test protects one behavior that would be easy to break without noticing.

Server (`server/src`):

- `physics/physics.test.ts`: after 10 simulated minutes, the pendulum still swings up to its starting angle, so the formula does not gain or lose energy.
- `simulation/simulation.test.ts`: pressing Start twice does not double the speed, pause freezes the pendulum, resume continues from the same spot, and stop resets it. A halt freezes it and keeps the collided ids, Start is ignored while halted, a restart goes back to the start and forgets the collision, and a paused pendulum ignores a halt.
- `physics/collision.test.ts`: balls collide up to the gap and not beyond, and a pendulum never collides with itself or with a crashed neighbor.
- `barrier/barrier.test.ts`: the restart happens 5 seconds after every online pendulum sent RESTART, not before, and the count starts fresh after each restart.
- `api/routes.test.ts`: a valid config is accepted, invalid values get a 400, and changes while running get a 409.
- `config/config.test.ts`: the port comes from the pendulum id, and an invalid id stops the server at startup.

Web (`web/src`):

- `components/controls/Controls.test.tsx`: the right buttons are enabled for each status, and only Stop while halted.
- `components/controls/ConfigPanel.test.tsx`: moving the anchor slider sends the new anchor position.
- `components/controls/CollisionBanner.test.tsx`: the banner names the two pendulums and counts down to the restart.
- `bus/overallStatus.test.ts`: one halted pendulum makes the whole group halted.
- `bus/snapshot.test.ts`: the snapshot carries the collision a halted pendulum reports.

The tests never wait in real time. Timer tests use Vitest's fake clock, so the results are the same on every run. Each test was checked by breaking the code it protects and watching it fail.

## Continuous integration

On every pull request and every push to `main`, GitHub Actions installs the packages and runs lint, the format check, the server typecheck, all tests, and the web build. Any failure shows a red check on the pull request.

## Known limitations

- Pendulums restart from the same angles, so a setup that collides every swing stops and restarts every 5 seconds until you press Stop.
- A page opened during a halt starts its countdown at 5 seconds, so it may show more time than is left.
- The pendulum runs about 2% slower than real time. Node timers fire slightly late, and each step always moves by exactly 1/60 s.
- A pendulum that crashes keeps its last state on the broker (only its presence is cleared by the Last Will). The page shows it as offline until it comes back.
- mqtt.js makes the page's JavaScript about 640 kB (200 kB compressed).
- The browser connects to the broker without a login. Fine locally, a real deployment needs authentication.
- The page's live view (the MQTT feed and the page that draws it) has no tests yet.
- The state lives in memory. Restarting the server resets the pendulum.
- No wind yet.
