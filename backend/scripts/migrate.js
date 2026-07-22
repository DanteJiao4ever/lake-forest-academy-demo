import process from "node:process";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadConfig } from "../src/config.js";
import { createPool } from "../src/db/postgres.js";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const config = loadConfig();
const pool = createPool(config);
const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../migrations");
const client = await pool.connect();

try {
  await client.query("SELECT pg_advisory_lock(hashtext('lake-forest-learning-migrations'))");
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      checksum char(64) NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of files) {
    const sql = await readFile(path.join(directory, name), "utf8");
    const { createHash } = await import("node:crypto");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const previous = await client.query("SELECT checksum FROM schema_migrations WHERE name = $1", [name]);
    if (previous.rows[0]) {
      if (previous.rows[0].checksum !== checksum) {
        throw new Error(`Applied migration ${name} was modified; create a new migration instead.`);
      }
      continue;
    }
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [name, checksum]);
      await client.query("COMMIT");
      process.stdout.write(`Applied ${name}\n`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  await client.query("SELECT pg_advisory_unlock(hashtext('lake-forest-learning-migrations'))").catch(() => {});
  client.release();
  await pool.end();
}
