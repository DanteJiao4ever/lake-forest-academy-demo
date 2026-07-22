import process from "node:process";
import { loadConfig } from "./config.js";
import { createPool, PostgresRepository } from "./db/postgres.js";
import { createGoogleDrive } from "./drive/google-drive.js";
import { ClamAvScanner } from "./lib/clamav.js";
import { createApp } from "./app.js";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const config = loadConfig();
const pool = createPool(config);
const repository = new PostgresRepository(pool);
const drive = await createGoogleDrive(config);
const scanner = new ClamAvScanner({
  host: config.clamavHost,
  port: config.clamavPort,
  required: config.clamavRequired,
});
const app = await createApp({ config, repository, drive, scanner });

async function shutdown(signal) {
  app.log.info({ signal }, "shutting down");
  await app.close();
  await repository.close();
  process.exit(0);
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error({ err: error }, "server failed to start");
  await repository.close();
  process.exit(1);
}
