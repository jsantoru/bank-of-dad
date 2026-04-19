import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const databasePath =
  process.env.DATABASE_PATH ?? path.join(rootDir, "data", "bank-of-dad.sqlite");
const schemaPath = path.join(rootDir, "src", "db", "schema.sql");

mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("foreign_keys = ON");
db.exec(readFileSync(schemaPath, "utf8"));
db.close();

console.log(`Initialized database at ${databasePath}`);

