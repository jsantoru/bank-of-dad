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

// Chart data helpers - return numeric values for visualization

export type BalanceOverTimeDataPoint = {
  date: string;
  balance: number; // in dollars
};

export type PortfolioDataPoint = {
  name: string;
  value: number; // in dollars
};

export type MonthlyTransactionDataPoint = {
  month: string;
  deposits: number; // in dollars
  withdrawals: number; // in dollars
};

export function getDashboardBalanceOverTime(
  startDate?: string | null,
  endDate?: string | null,
): BalanceOverTimeDataPoint[] {
  const db = openDatabase();

  try {
    initializeDatabase(db);

    const accounts = listAccountSummaries(db);
    if (accounts.length === 0) return [];

    // Get all account details with full ledger
    const accountDetails = accounts
      .map((acc) => getAccountDetail(db, acc.id))
      .filter((acc) => acc !== null);

    if (accountDetails.length === 0) return [];

    // Build a map of date -> total balance
    const dateBalanceMap = new Map<string, number>();

    accountDetails.forEach((account) => {
      account.ledger.forEach((row) => {
        const currentTotal = dateBalanceMap.get(row.date) || 0;
        dateBalanceMap.set(
          row.date,
          currentTotal + row.endingBalanceCents / 100,
        );
      });
    });

    // Convert to array and sort by date
    let data = Array.from(dateBalanceMap.entries())
      .map(([date, balance]) => ({ date, balance }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Apply date range filter if specified
    if (startDate) {
      data = data.filter((d) => d.date >= startDate);
    }
    if (endDate) {
      data = data.filter((d) => d.date <= endDate);
    }

    return data;
  } finally {
    db.close();
  }
}

export function getDashboardPortfolioComposition(): PortfolioDataPoint[] {
  const db = openDatabase();

  try {
    initializeDatabase(db);

    const accounts = listAccountSummaries(db);

    return accounts
      .map((account) => ({
        name: account.name,
        value: account.currentBalanceCents / 100,
      }))
      .filter((item) => item.value > 0);
  } finally {
    db.close();
  }
}

export function getAccountBalanceOverTime(
  accountId: number,
  startDate?: string | null,
  endDate?: string | null,
): BalanceOverTimeDataPoint[] {
  const db = openDatabase();

  try {
    initializeDatabase(db);

    const account = getAccountDetail(db, accountId);
    if (!account) return [];

    let data = account.ledger.map((row) => ({
      date: row.date,
      balance: row.endingBalanceCents / 100,
    }));

    // Apply date range filter if specified
    if (startDate) {
      data = data.filter((d) => d.date >= startDate);
    }
    if (endDate) {
      data = data.filter((d) => d.date <= endDate);
    }

    return data;
  } finally {
    db.close();
  }
}

export function getAccountMonthlyTransactions(
  accountId: number,
  startDate?: string | null,
  endDate?: string | null,
): MonthlyTransactionDataPoint[] {
  const db = openDatabase();

  try {
    initializeDatabase(db);

    const account = getAccountDetail(db, accountId);
    if (!account) return [];

    // Filter transactions by date range if specified
    let transactions = account.transactions;
    if (startDate) {
      transactions = transactions.filter((t) => t.date >= startDate);
    }
    if (endDate) {
      transactions = transactions.filter((t) => t.date <= endDate);
    }

    // Group transactions by month
    const monthlyData = new Map<
      string,
      { deposits: number; withdrawals: number }
    >();

    transactions.forEach((transaction) => {
      const month = transaction.date.substring(0, 7); // YYYY-MM
      const existing = monthlyData.get(month) || { deposits: 0, withdrawals: 0 };

      if (transaction.type === "deposit") {
        existing.deposits += transaction.amountCents / 100;
      } else {
        existing.withdrawals += transaction.amountCents / 100;
      }

      monthlyData.set(month, existing);
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        deposits: data.deposits,
        withdrawals: data.withdrawals,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } finally {
    db.close();
  }
}
