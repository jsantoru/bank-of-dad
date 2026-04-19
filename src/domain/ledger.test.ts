import { describe, expect, it } from "vitest";
import { annualToDailyRate, buildLedger } from "./ledger";

describe("annualToDailyRate", () => {
  it("converts annual basis points to the spreadsheet daily rate", () => {
    expect(annualToDailyRate(5000)).toBeCloseTo(0.00137, 5);
  });
});

describe("buildLedger", () => {
  it("applies same-day deposits before interest", () => {
    const rows = buildLedger({
      startDate: "2025-01-01",
      endDate: "2025-01-01",
      interestRateChanges: [
        {
          id: 1,
          effectiveDate: "2025-01-01",
          annualRateBasisPoints: 5000,
        },
      ],
      transactions: [
        {
          id: 1,
          date: "2025-01-01",
          type: "deposit",
          amountCents: 23_900,
        },
      ],
    });

    expect(rows).toEqual([
      expect.objectContaining({
        date: "2025-01-01",
        startingBalanceCents: 0,
        depositsCents: 23_900,
        withdrawalsCents: 0,
        annualRateBasisPoints: 5000,
        interestCents: 33,
        endingBalanceCents: 23_933,
        totalInterestCents: 33,
      }),
    ]);
  });

  it("uses the rate active on each date", () => {
    const rows = buildLedger({
      startDate: "2025-01-01",
      endDate: "2025-01-03",
      interestRateChanges: [
        {
          id: 1,
          effectiveDate: "2025-01-01",
          annualRateBasisPoints: 5000,
        },
        {
          id: 2,
          effectiveDate: "2025-01-03",
          annualRateBasisPoints: 1000,
        },
      ],
      transactions: [
        {
          id: 1,
          date: "2025-01-01",
          type: "deposit",
          amountCents: 10_000,
        },
      ],
    });

    expect(rows.map((row) => row.annualRateBasisPoints)).toEqual([
      5000, 5000, 1000,
    ]);
  });

  it("subtracts withdrawals before interest", () => {
    const rows = buildLedger({
      startDate: "2025-01-01",
      endDate: "2025-01-02",
      interestRateChanges: [
        {
          id: 1,
          effectiveDate: "2025-01-01",
          annualRateBasisPoints: 5000,
        },
      ],
      transactions: [
        {
          id: 1,
          date: "2025-01-01",
          type: "deposit",
          amountCents: 10_000,
        },
        {
          id: 2,
          date: "2025-01-02",
          type: "withdrawal",
          amountCents: 5_000,
        },
      ],
    });

    expect(rows[1]).toEqual(
      expect.objectContaining({
        startingBalanceCents: 10_014,
        withdrawalsCents: 5_000,
        interestCents: 7,
        endingBalanceCents: 5_021,
      }),
    );
  });
});
