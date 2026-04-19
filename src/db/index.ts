import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export function getDatabasePath() {
  return (
    process.env.DATABASE_PATH ??
    path.join(process.cwd(), "data", "bank-of-dad.sqlite")
  );
}

export function openDatabase() {
  const databasePath = getDatabasePath();

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = new Database(databasePath);
  db.pragma("foreign_keys = ON");

  return db;
}

export function initializeDatabase(db: Database.Database) {
  const schemaPath = path.join(process.cwd(), "src", "db", "schema.sql");

  db.exec(fs.readFileSync(schemaPath, "utf8"));
}

