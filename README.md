# Pendulum Simulation

Five pendulums, each one simulated by its own Node.js server, drawn and controlled from a React page. When two balls get too close, every pendulum stops, and they all restart together 5 seconds later.

## Quick start

You need Node 22 (see `.nvmrc`).

```bash
npm install
npm start
```

Open http://localhost:5173. `npm start` runs the MQTT broker, 5 pendulum servers and the web app. Ctrl+C stops them all.

- Another number of pendulums (1 to 10): `PENDULUM_COUNT=3 npm start`
- One server alone: `PENDULUM_ID=3 npm run dev --workspace server`. Pendulum `id` listens on port `3000 + id`.

## Scripts

Run them from the root.

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm start`         | Runs the broker, all pendulum servers and the web app |
| `npm test`          | Runs all server and web tests                         |
| `npm run test:ui`   | Opens the test results in the browser                 |
| `npm run lint`      | Checks the code with ESLint                           |
| `npm run format`    | Formats the code with Prettier                        |
| `npm run typecheck` | Checks the server and launcher types                  |
| `npm run build`     | Builds the web app (also checks the web types)        |

## Requirements

| Requirement                                                   | Status   |
| ------------------------------------------------------------- | -------- |
| One Node.js server per pendulum, with angle, mass and length  | Done     |
| Five instances                                                | Done     |
| Neighbor monitoring, collision threshold, STOP, RESTART, 5 s  | Done     |
| React UI: draw, configure, start, pause, stop, live positions | Done     |
| Bonus: anchor position, TypeScript, one command, unit tests   | Done     |
| Bonus: wind                                                   | Not done |

### Added beyond the spec

- Live updates pushed over MQTT instead of polling, redrawn at most once per screen frame.
- Any number of pendulums from 1 to 10 with `PENDULUM_COUNT`, no code change needed.
- Offline detection: a crashed server shows as offline on the page, and its button is disabled.
- Fail safe: a server that loses the broker pauses, so it never swings without hearing STOP.
- A collision banner that names the two pendulums and counts down to the restart.
- Shared code: types, limits and topics live once in `shared/`, used by both apps.
- Input validation with clear error messages (400 for bad values, 409 when not stopped).
- CI on GitHub Actions: lint, format, typecheck, tests and build on every pull request.

## Architecture

```
┌──────────────────────┐   POST /start /pause /stop /config   ┌──────────────────────┐
│  web (React)         │ ───────────────────────────────────► │  pendulum servers    │
│  draws the pendulums │          (REST, through Vite)        │  one pendulum each   │
│  sends commands      │                                      │  60 steps per second │
└──────────┬───────────┘                                      └──────────┬───────────┘
           │  presence + state (MQTT over WebSocket)                     │  presence, state, STOP, RESTART
           └─────────────────────►  broker (Aedes)  ◄────────────────────┘
```

- Each server owns one pendulum, moves it 60 times per second and publishes its state to the broker after every step.
- Servers never call each other. Each one announces itself on `pendulum/{id}/presence` and listens to everyone's presence and state. No server has a list of its neighbors, so a new pendulum is just one more process.
- The page computes no physics. It draws what the broker sends and sends commands over REST. Through Vite's proxy, `/api/{id}/...` goes to pendulum `id` and `/mqtt` goes to the broker, so the browser talks to one address.

### Collisions

1. After each step, a running server compares its ball with every other online pendulum that is not halted. They collide when the gap between the balls is 20 cm or less (`COLLISION_GAP`).
2. It halts (status `halted`) and publishes `system/stop` with the two ids, for example `[2, 3]`.
3. Every server that hears STOP halts too and publishes `system/restart`.
4. Once a server has heard RESTART from every online pendulum, it waits 5 seconds (`RESTART_DELAY_MS`) and restarts from its starting angle.
5. The page shows "Pendulums 2 and 3 collided. Restarting in 5 s." Only Stop works during the halt.

### Code map

```
server/src
  physics/      step() and collides(): pure functions
  simulation/   createSimulation(): the pendulum, its status and its timer
  barrier/      createRestartBarrier(): waits for every RESTART, then 5 seconds
  bus/          connectBus(): MQTT presence, state, STOP and RESTART
  api/          Express routes, with zod validation
  config/       loadConfig(): reads and checks PENDULUM_ID, PORT, BROKER_URL
  broker/       startBroker(): the Aedes broker, TCP 1883 and WebSocket 8888
web/src
  bus/          pendulumFeed(): one MQTT connection, one fresh snapshot per frame
  api/          one function per REST command
  hooks/        usePendulums(): the live snapshot plus start, pause, stop and config
  components/   controls (buttons, sliders, badges, collision banner) and the SVG drawing
shared/         types, limits, MQTT topics and live state, used by both apps
```

### API

Every route returns the full state: `{ id, status, config, angle, velocity, ball, collision }`. `collision` holds the two collided ids while `halted`, otherwise `null`. Validation errors return `{ error: "message" }`.

| Route          | What it does                                    | Errors                                        |
| -------------- | ----------------------------------------------- | --------------------------------------------- |
| `GET /state`   | Returns the current state                       |                                               |
| `POST /start`  | Starts or resumes, ignored while halted         |                                               |
| `POST /pause`  | Freezes it where it is                          |                                               |
| `POST /stop`   | Stops it and resets it to its starting angle    |                                               |
| `POST /config` | Changes `angleDeg`, `length`, `mass`, `anchorX` | 400 if a value is invalid, 409 if not stopped |

Limits: angle -90 to 90 degrees, length 0.5 to 3 m, mass 0.5 to 5 kg, anchor 0 to 10 m.

### Stack

TypeScript everywhere. Server: Express 5, zod, Aedes and mqtt.js, run with tsx (no build step). Web: React 19, Vite, TanStack Query, axios, Tailwind, React Compiler. Tests: Vitest, supertest, Testing Library. Tooling: npm workspaces, ESLint, Prettier, GitHub Actions.

## Decisions and trade-offs

- A broker between the servers instead of direct calls. Servers find each other for free and the design does not depend on the number 5. Trade-off: the broker is a single point of failure.
- A server that loses the broker pauses its pendulum. Without the broker it cannot hear a STOP, so it must not keep swinging blind. Trade-off: you press Start again once it is back.
- REST for commands, MQTT for live state. Commands need a clear answer (400, 409), MQTT has none. Positions are a stream, which MQTT pushes. Trade-off: two protocols instead of one.
- Every pendulum checks every other one, not only the next one. Anchors can move, so "next to" can change. Trade-off: the checks grow with the square of the count, fine for 10 pendulums.
- Fixed step of 1/60 s, updating the speed before the angle. The swing height stays stable and the same steps always give the same result, which makes tests exact. Trade-off: it runs about 2% slower than real time.
- After each reconnect, servers and page forget what they knew and rebuild from the broker's kept messages, so a pendulum that died meanwhile does not stay on screen.
- The collided ids live in each pendulum's kept state, so a page opened during a halt still shows the collision.
- The config only changes while stopped (409 otherwise). Changing the length mid swing would make the ball jump.
- Mass only changes the ball's size. Without air resistance, mass does not change how a pendulum swings.

## Tests

```bash
npm test
```

Each test protects one behavior that would be easy to break without noticing. Timer tests use Vitest's fake clock, so nothing waits in real time.

- Physics: after 10 simulated minutes the pendulum still swings up to its starting angle (no energy gained or lost).
- Collisions: balls collide up to the gap and not beyond, never with themselves or with a crashed neighbor.
- Simulation: Start twice does not double the speed, pause, resume, stop, halt and restart behave as described above.
- Restart barrier: restarts 5 seconds after every online pendulum sent RESTART, not before, and starts a fresh count after each restart.
- API: a valid config is accepted, invalid values get a 400, changes while running get a 409.
- Config: the port comes from the pendulum id, and an invalid id stops the server at startup.
- Web: the right buttons for each status, the anchor slider sends its value, the banner names the pendulums and counts down, one halted pendulum makes the group halted.

CI runs lint, the format check, the typecheck, all tests and the web build on every pull request and every push to `main`.

## Known limitations

- It only runs in dev mode: the page reaches the servers and the broker through Vite's dev proxy.
- A page opened during a halt starts its countdown at 5 seconds, so it may show more time than is left.
- The broker has no login. Fine locally, not for a real deployment.
- The state lives in memory. Restarting a server resets its pendulum.

## With more time

- Wind: one wind setting on the page, sent to every server and added to the pendulum's acceleration.
- An end to end test: start the broker and two servers, force a collision, and check the full STOP, RESTART and 5 second cycle.
- A restart barrier that checks again when a pendulum goes offline, so a crash during a halt does not block the others.
- Docker and a real deployment: one Docker Compose file for the broker, the servers and the web app, deployed online, with a small gateway in place of the Vite proxy that would also find new servers on its own.
- Steps based on the real elapsed time, to remove the 2% drift.
- Dragging the ball or anchor directly in the drawing.
- Authentication: only logged in users could send commands or change the config, on both the REST API and the broker.
