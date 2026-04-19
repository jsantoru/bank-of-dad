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

const imports = parseArgs(process.argv.slice(2));

if (imports.length === 0) {
  console.error(
    'Usage: npm run db:import -- "Account Name=C:\\path\\to\\export.csv"',
  );
  process.exit(1);
}

mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("foreign_keys = ON");
db.exec(readFileSync(schemaPath, "utf8"));

const importAccount = db.transaction(({ accountName, filePath }) => {
  const parsed = parseBankCsv(filePath);
  const accountId = upsertAccount(accountName);

  db.prepare("DELETE FROM transactions WHERE account_id = ?").run(accountId);
  db.prepare("DELETE FROM interest_rate_changes WHERE account_id = ?").run(
    accountId,
  );

  db.prepare(
    `
    INSERT INTO interest_rate_changes (
      account_id,
      effective_date,
      annual_rate_basis_points
    )
    VALUES (?, ?, ?)
    `,
  ).run(accountId, parsed.firstDate, parsed.annualRateBasisPoints);

  const insertTransaction = db.prepare(
    `
    INSERT INTO transactions (
      account_id,
      transaction_date,
      type,
      amount_cents,
      note
    )
    VALUES (?, ?, ?, ?, ?)
    `,
  );

  for (const transaction of parsed.transactions) {
    insertTransaction.run(
      accountId,
      transaction.date,
      transaction.type,
      transaction.amountCents,
      "Imported from spreadsheet",
    );
  }

  return {
    accountName,
    firstDate: parsed.firstDate,
    lastDate: parsed.lastDate,
    annualRateBasisPoints: parsed.annualRateBasisPoints,
    transactions: parsed.transactions.length,
    sheetEndingBalanceCents: parsed.sheetEndingBalanceCents,
  };
});

for (const importSpec of imports) {
  const result = importAccount(importSpec);

  console.log(
    [
      `Imported ${result.accountName}`,
      `${result.transactions} transactions`,
      `${result.firstDate} through ${result.lastDate}`,
      `${formatBasisPoints(result.annualRateBasisPoints)} annual rate`,
      `${formatCents(result.sheetEndingBalanceCents)} sheet ending balance`,
    ].join(" | "),
  );
}

db.close();

function parseArgs(args) {
  return args.map((arg) => {
    const separatorIndex = arg.indexOf("=");

    if (separatorIndex === -1) {
      throw new Error(`Invalid import argument: ${arg}`);
    }

    return {
      accountName: arg.slice(0, separatorIndex).trim(),
      filePath: arg.slice(separatorIndex + 1).trim(),
    };
  });
}

function parseBankCsv(filePath) {
  const lines = readFileSync(filePath, "utf8").trimEnd().split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.startsWith("Date,"));

  if (headerIndex === -1) {
    throw new Error(`Could not find ledger header in ${filePath}`);
  }

  const annualRateBasisPoints = parsePercentToBasisPoints(
    lines[4]?.split(",")[1],
  );
  const rows = lines
    .slice(headerIndex + 1)
    .filter(Boolean)
    .map((line) => parseLedgerRow(line));

  if (rows.length === 0) {
    throw new Error(`No ledger rows found in ${filePath}`);
  }

  return {
    annualRateBasisPoints,
    firstDate: rows[0].date,
    lastDate: rows.at(-1).date,
    sheetEndingBalanceCents: rows.at(-1).endingBalanceCents,
    transactions: rows.flatMap((row) => {
      const transactions = [];

      if (row.depositsCents > 0) {
        transactions.push({
          date: row.date,
          type: "deposit",
          amountCents: row.depositsCents,
        });
      }

      if (row.withdrawalsCents > 0) {
        transactions.push({
          date: row.date,
          type: "withdrawal",
          amountCents: row.withdrawalsCents,
        });
      }

      return transactions;
    }),
  };
}

function parseLedgerRow(line) {
  const cols = line.split(",");

  return {
    date: parseSheetDate(cols[0]),
    depositsCents: parseMoneyToCents(cols[2]),
    withdrawalsCents: parseMoneyToCents(cols[3]),
    endingBalanceCents: parseMoneyToCents(cols[5]),
  };
}

function parseSheetDate(value) {
  const [month, day, year] = value.split("-").map(Number);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseMoneyToCents(value) {
  return Math.round(Number((value ?? "").replace(/[$,]/g, "")) * 100);
}

function parsePercentToBasisPoints(value) {
  return Math.round(Number((value ?? "").replace("%", "")) * 100);
}

function upsertAccount(name) {
  const existing = db.prepare("SELECT id FROM accounts WHERE name = ?").get(name);

  if (existing) {
    return Number(existing.id);
  }

  const result = db.prepare("INSERT INTO accounts (name) VALUES (?)").run(name);
  return Number(result.lastInsertRowid);
}

function formatCents(cents) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(cents / 100);
}

function formatBasisPoints(basisPoints) {
  return `${basisPoints / 100}%`;
}
