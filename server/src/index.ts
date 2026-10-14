import { createApp } from "@/api";
import { createSimulation } from "@/simulation";

const PORT = Number(process.env.PORT ?? 3001);

createApp(createSimulation()).listen(PORT, () => {
  console.log(`Pendulum server on http://localhost:${PORT}`);
});
