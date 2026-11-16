import app from "./app";
import { logger } from "./lib/logger";
import { geocodeMissingProperties } from "./lib/geocode";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Ubica en el mapa (zona aproximada) las propiedades que todavía no tienen.
  setTimeout(() => {
    geocodeMissingProperties().catch((err) => logger.error({ err }, "Error ubicando propiedades en el mapa"));
  }, 5000);
});
