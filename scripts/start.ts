import { concurrently } from "concurrently";

const DEFAULT_PENDULUM_COUNT = 5;
const MAX_PENDULUM_COUNT = 10;

function pendulumCount(): number {
  const count = Number(process.env.PENDULUM_COUNT ?? DEFAULT_PENDULUM_COUNT);
  if (!Number.isInteger(count) || count < 1 || count > MAX_PENDULUM_COUNT) {
    throw new Error(`PENDULUM_COUNT must be a whole number from 1 to ${MAX_PENDULUM_COUNT}`);
  }
  return count;
}

const ids = Array.from({ length: pendulumCount() }, (_, index) => index + 1);

const pendulums = ids.map((id) => ({
  name: `pendulum-${id}`,
  command: "npm run --silent dev --workspace server",
  env: { PENDULUM_ID: String(id) },
}));

const web = { name: "web", command: "npm run --silent dev --workspace web" };

const { result } = concurrently([...pendulums, web], { prefix: "name" });

result.catch(() => process.exit(1));
