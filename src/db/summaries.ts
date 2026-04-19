import { formatBasisPoints, formatCents } from "@/domain/money";
import { initializeDatabase, openDatabase } from "./index";
import { getAccountDetail, listAccountSummaries } from "./queries";

export type DashboardAccountSummary = {
  id: number;
  name: string;
  currentBalance: string;
  totalInterest: string;
  transactionCount: number;
  currentAnnualRate: string;
};

export type AccountPageSummary = DashboardAccountSummary & {
  transactions: Array<{
    id: number;
    date: string;
    type: "deposit" | "withdrawal";
    amount: string;
    note: string | null | undefined;
  }>;
  recentLedgerRows: Array<{
    date: string;
    startingBalance: string;
    deposits: string;
    withdrawals: string;
    interest: string;
    endingBalance: string;
    totalInterest: string;
  }>;
};

export function getDashboardAccountSummaries(): DashboardAccountSummary[] {
  const db = openDatabase();

  try {
    initializeDatabase(db);

    return listAccountSummaries(db).map((account) => ({
      id: account.id,
      name: account.name,
      currentBalance: formatCents(account.currentBalanceCents),
      totalInterest: formatCents(account.totalInterestCents),
      transactionCount: account.transactionCount,
      currentAnnualRate: formatBasisPoints(
        account.currentAnnualRateBasisPoints,
      ),
    }));
  } finally {
    db.close();
  }
}

export function getAccountPageSummary(
  accountId: number,
): AccountPageSummary | null {
  const db = openDatabase();

  try {
    initializeDatabase(db);

    const account = getAccountDetail(db, accountId);

    if (!account) {
      return null;
    }

    return {
      id: account.id,
      name: account.name,
      currentBalance: formatCents(account.currentBalanceCents),
      totalInterest: formatCents(account.totalInterestCents),
      transactionCount: account.transactionCount,
      currentAnnualRate: formatBasisPoints(
        account.currentAnnualRateBasisPoints,
      ),
      transactions: account.transactions.map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        type: transaction.type,
        amount: formatCents(transaction.amountCents),
        note: transaction.note,
      })),
      recentLedgerRows: account.ledger
        .slice(-30)
        .reverse()
        .map((row) => ({
          date: row.date,
          startingBalance: formatCents(row.startingBalanceCents),
          deposits: formatCents(row.depositsCents),
          withdrawals: formatCents(row.withdrawalsCents),
          interest: formatCents(row.interestCents),
          endingBalance: formatCents(row.endingBalanceCents),
          totalInterest: formatCents(row.totalInterestCents),
        })),
    };
  } finally {
    db.close();
  }
}
