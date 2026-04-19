import { formatBasisPoints, formatCents, formatRate } from "@/domain/money";
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

export type DashboardOverview = {
  accounts: DashboardAccountSummary[];
  totalBalance: string;
  totalInterest: string;
  activeAccounts: number;
  totalTransactions: number;
};

export type AccountPageSummary = DashboardAccountSummary & {
  interestRateChanges: Array<{
    id: number;
    effectiveDate: string;
    annualRate: string;
  }>;
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
    annualRate: string;
    dailyRate: string;
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

export function getDashboardOverview(): DashboardOverview {
  const db = openDatabase();

  try {
    initializeDatabase(db);

    const accountSummaries = listAccountSummaries(db);

    return {
      accounts: accountSummaries.map((account) => ({
        id: account.id,
        name: account.name,
        currentBalance: formatCents(account.currentBalanceCents),
        totalInterest: formatCents(account.totalInterestCents),
        transactionCount: account.transactionCount,
        currentAnnualRate: formatBasisPoints(
          account.currentAnnualRateBasisPoints,
        ),
      })),
      totalBalance: formatCents(
        accountSummaries.reduce(
          (total, account) => total + account.currentBalanceCents,
          0,
        ),
      ),
      totalInterest: formatCents(
        accountSummaries.reduce(
          (total, account) => total + account.totalInterestCents,
          0,
        ),
      ),
      activeAccounts: accountSummaries.length,
      totalTransactions: accountSummaries.reduce(
        (total, account) => total + account.transactionCount,
        0,
      ),
    };
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
      interestRateChanges: [...account.interestRateChanges]
        .reverse()
        .map((rate) => ({
          id: rate.id,
          effectiveDate: rate.effectiveDate,
          annualRate: formatBasisPoints(rate.annualRateBasisPoints),
        })),
      transactions: [...account.transactions]
        .reverse()
        .map((transaction) => ({
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
          annualRate: formatBasisPoints(row.annualRateBasisPoints),
          dailyRate: formatRate(row.dailyInterestRate),
          interest: formatCents(row.interestCents),
          endingBalance: formatCents(row.endingBalanceCents),
          totalInterest: formatCents(row.totalInterestCents),
        })),
    };
  } finally {
    db.close();
  }
}
