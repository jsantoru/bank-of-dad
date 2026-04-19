import { basisPointsToRate } from "./money";

export type LedgerTransaction = {
  id: number;
  date: string;
  type: "deposit" | "withdrawal";
  amountCents: number;
  note?: string | null;
};

export type LedgerInterestRateChange = {
  id: number;
  effectiveDate: string;
  annualRateBasisPoints: number;
};

export type LedgerRow = {
  date: string;
  startingBalanceCents: number;
  depositsCents: number;
  withdrawalsCents: number;
  annualRateBasisPoints: number;
  dailyInterestRate: number;
  interestCents: number;
  endingBalanceCents: number;
  totalInterestCents: number;
};

type BuildLedgerInput = {
  transactions: LedgerTransaction[];
  interestRateChanges: LedgerInterestRateChange[];
  startDate: string;
  endDate: string;
};

const dayInMs = 24 * 60 * 60 * 1000;

export function buildLedger({
  transactions,
  interestRateChanges,
  startDate,
  endDate,
}: BuildLedgerInput): LedgerRow[] {
  if (compareDates(startDate, endDate) > 0) {
    return [];
  }

  const sortedTransactions = [...transactions].sort((a, b) =>
    compareDates(a.date, b.date),
  );
  const sortedRates = [...interestRateChanges].sort((a, b) =>
    compareDates(a.effectiveDate, b.effectiveDate),
  );

  let transactionIndex = 0;
  let rateIndex = 0;
  let balanceCents = 0;
  let totalInterestCents = 0;
  let activeAnnualRateBasisPoints = 0;
  const rows: LedgerRow[] = [];

  for (const date of eachDate(startDate, endDate)) {
    while (
      rateIndex < sortedRates.length &&
      compareDates(sortedRates[rateIndex].effectiveDate, date) <= 0
    ) {
      activeAnnualRateBasisPoints =
        sortedRates[rateIndex].annualRateBasisPoints;
      rateIndex += 1;
    }

    let depositsCents = 0;
    let withdrawalsCents = 0;

    while (
      transactionIndex < sortedTransactions.length &&
      sortedTransactions[transactionIndex].date === date
    ) {
      const transaction = sortedTransactions[transactionIndex];

      if (transaction.type === "deposit") {
        depositsCents += transaction.amountCents;
      } else {
        withdrawalsCents += transaction.amountCents;
      }

      transactionIndex += 1;
    }

    const startingBalanceCents = balanceCents;
    const balanceBeforeInterestCents =
      startingBalanceCents + depositsCents - withdrawalsCents;
    const dailyInterestRate = annualToDailyRate(
      activeAnnualRateBasisPoints,
    );
    const interestCents = Math.round(
      balanceBeforeInterestCents * dailyInterestRate,
    );
    const endingBalanceCents = balanceBeforeInterestCents + interestCents;

    totalInterestCents += interestCents;
    balanceCents = endingBalanceCents;

    rows.push({
      date,
      startingBalanceCents,
      depositsCents,
      withdrawalsCents,
      annualRateBasisPoints: activeAnnualRateBasisPoints,
      dailyInterestRate,
      interestCents,
      endingBalanceCents,
      totalInterestCents,
    });
  }

  return rows;
}

export function annualToDailyRate(annualRateBasisPoints: number) {
  return basisPointsToRate(annualRateBasisPoints) / 365;
}

function compareDates(a: string, b: string) {
  return a.localeCompare(b);
}

function* eachDate(startDate: string, endDate: string) {
  let current = parseDate(startDate);
  const end = parseDate(endDate);

  while (current <= end) {
    yield formatDate(current);
    current = new Date(current.getTime() + dayInMs);
  }
}

function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
