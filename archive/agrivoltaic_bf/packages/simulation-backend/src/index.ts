import { createSimulationServer } from "./api/server.js";

const port = Number(process.env.PORT ?? "8787");
const app = createSimulationServer();

app.listen(port, () => {
  console.log(`Simulation backend listening on http://localhost:${port}`);
});
