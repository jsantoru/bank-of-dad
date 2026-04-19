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

const accountName = "Sample Checking";
const existingAccount = db
  .prepare("SELECT id FROM accounts WHERE name = ?")
  .get(accountName);

if (existingAccount) {
  console.log(`Seed account already exists in ${databasePath}`);
  db.close();
  process.exit(0);
}

const insertAccount = db.prepare("INSERT INTO accounts (name) VALUES (?)");
const insertTransaction = db.prepare(`
  INSERT INTO transactions (account_id, transaction_date, type, amount_cents, note)
  VALUES (?, ?, ?, ?, ?)
`);
const insertRate = db.prepare(`
  INSERT INTO interest_rate_changes (
    account_id,
    effective_date,
    annual_rate_basis_points
  )
  VALUES (?, ?, ?)
`);

const seed = db.transaction(() => {
  const result = insertAccount.run(accountName);
  const accountId = Number(result.lastInsertRowid);

  insertRate.run(accountId, "2025-01-01", 5000);
  insertTransaction.run(
    accountId,
    "2025-01-01",
    "deposit",
    23_900,
    "Initial sample balance",
  );
  insertTransaction.run(
    accountId,
    "2025-01-11",
    "deposit",
    800,
    "Sample deposit",
  );
});

seed();
db.close();

console.log(`Seeded sample account in ${databasePath}`);

