import type { Database } from "better-sqlite3";
import {
  buildLedger,
  type LedgerRow,
  type LedgerInterestRateChange,
  type LedgerTransaction,
} from "@/domain/ledger";

export type Account = {
  id: number;
  name: string;
  createdAt: string;
  archivedAt: string | null;
};

export type AccountSummary = Account & {
  currentBalanceCents: number;
  totalInterestCents: number;
  transactionCount: number;
  currentAnnualRateBasisPoints: number;
};

export type AccountDetail = AccountSummary & {
  transactions: LedgerTransaction[];
  interestRateChanges: LedgerInterestRateChange[];
  ledger: LedgerRow[];
};

export type NewTransaction = {
  accountId: number;
  date: string;
  type: "deposit" | "withdrawal";
  amountCents: number;
  note?: string | null;
};

type AccountRow = {
  id: number;
  name: string;
  created_at: string;
  archived_at: string | null;
};

type TransactionRow = {
  id: number;
  transaction_date: string;
  type: "deposit" | "withdrawal";
  amount_cents: number;
  note: string | null;
};

type InterestRateChangeRow = {
  id: number;
  effective_date: string;
  annual_rate_basis_points: number;
};

type CountRow = {
  count: number;
};

export function listAccounts(db: Database): Account[] {
  const rows = db
    .prepare(
      `
      SELECT id, name, created_at, archived_at
      FROM accounts
      WHERE archived_at IS NULL
      ORDER BY name
      `,
    )
    .all() as AccountRow[];

  return rows.map(mapAccount);
}

export function getAccount(db: Database, accountId: number): Account | null {
  const row = db
    .prepare(
      `
      SELECT id, name, created_at, archived_at
      FROM accounts
      WHERE id = ?
      `,
    )
    .get(accountId) as AccountRow | undefined;

  return row ? mapAccount(row) : null;
}

export function listTransactionsForAccount(
  db: Database,
  accountId: number,
): LedgerTransaction[] {
  const rows = db
    .prepare(
      `
      SELECT id, transaction_date, type, amount_cents, note
      FROM transactions
      WHERE account_id = ?
      ORDER BY transaction_date, id
      `,
    )
    .all(accountId) as TransactionRow[];

  return rows.map((row) => ({
    id: row.id,
    date: row.transaction_date,
    type: row.type,
    amountCents: row.amount_cents,
    note: row.note,
  }));
}

export function createTransaction(db: Database, transaction: NewTransaction) {
  const result = db
    .prepare(
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
    )
    .run(
      transaction.accountId,
      transaction.date,
      transaction.type,
      transaction.amountCents,
      transaction.note?.trim() || null,
    );

  return Number(result.lastInsertRowid);
}

export function deleteTransaction(
  db: Database,
  accountId: number,
  transactionId: number,
) {
  const result = db
    .prepare(
      `
      DELETE FROM transactions
      WHERE id = ? AND account_id = ?
      `,
    )
    .run(transactionId, accountId);

  return result.changes;
}

export function listInterestRateChangesForAccount(
  db: Database,
  accountId: number,
): LedgerInterestRateChange[] {
  const rows = db
    .prepare(
      `
      SELECT id, effective_date, annual_rate_basis_points
      FROM interest_rate_changes
      WHERE account_id = ?
      ORDER BY effective_date, id
      `,
    )
    .all(accountId) as InterestRateChangeRow[];

  return rows.map((row) => ({
    id: row.id,
    effectiveDate: row.effective_date,
    annualRateBasisPoints: row.annual_rate_basis_points,
  }));
}

export function listAccountSummaries(
  db: Database,
  asOfDate = formatDate(new Date()),
): AccountSummary[] {
  return listAccounts(db).map((account) =>
    buildAccountSummary(db, account, asOfDate),
  );
}

export function getAccountDetail(
  db: Database,
  accountId: number,
  asOfDate = formatDate(new Date()),
): AccountDetail | null {
  const account = getAccount(db, accountId);

  if (!account || account.archivedAt) {
    return null;
  }

  const transactions = listTransactionsForAccount(db, account.id);
  const interestRateChanges = listInterestRateChangesForAccount(db, account.id);
  const startDate = getStartDate(transactions, interestRateChanges, asOfDate);
  const ledger = buildLedger({
    transactions,
    interestRateChanges,
    startDate,
    endDate: asOfDate,
  });
  const summary = buildAccountSummary(db, account, asOfDate);

  return {
    ...summary,
    transactions,
    interestRateChanges,
    ledger,
  };
}

function buildAccountSummary(
  db: Database,
  account: Account,
  asOfDate: string,
): AccountSummary {
  const transactions = listTransactionsForAccount(db, account.id);
  const interestRateChanges = listInterestRateChangesForAccount(db, account.id);
  const startDate = getStartDate(transactions, interestRateChanges, asOfDate);
  const ledger = buildLedger({
    transactions,
    interestRateChanges,
    startDate,
    endDate: asOfDate,
  });
  const latestLedgerRow = ledger.at(-1);
  const activeRate = [...interestRateChanges]
    .filter((rate) => rate.effectiveDate <= asOfDate)
    .at(-1);

  return {
    ...account,
    currentBalanceCents: latestLedgerRow?.endingBalanceCents ?? 0,
    totalInterestCents: latestLedgerRow?.totalInterestCents ?? 0,
    transactionCount: getTransactionCount(db, account.id),
    currentAnnualRateBasisPoints: activeRate?.annualRateBasisPoints ?? 0,
  };
}

function getTransactionCount(db: Database, accountId: number) {
  const row = db
    .prepare(
      `
      SELECT COUNT(*) as count
      FROM transactions
      WHERE account_id = ?
      `,
    )
    .get(accountId) as CountRow | undefined;

  return row?.count ?? 0;
}

function getStartDate(
  transactions: LedgerTransaction[],
  interestRateChanges: LedgerInterestRateChange[],
  fallbackDate: string,
) {
  const dates = [
    ...transactions.map((transaction) => transaction.date),
    ...interestRateChanges.map((rate) => rate.effectiveDate),
  ].sort();

  return dates[0] ?? fallbackDate;
}

function mapAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
