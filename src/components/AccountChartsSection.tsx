"use client";

import { useState } from "react";
import { AccountBalanceChart } from "./AccountBalanceChart";
import { TransactionActivityChart } from "./TransactionActivityChart";
import { DateRangeFilter } from "./DateRangeFilter";
import type {
  BalanceOverTimeDataPoint,
  MonthlyTransactionDataPoint,
} from "@/db/summaries";

type Props = {
  accountId: number;
  initialBalanceData: BalanceOverTimeDataPoint[];
  initialTransactionData: MonthlyTransactionDataPoint[];
};

export function AccountChartsSection({
  accountId,
  initialBalanceData,
  initialTransactionData,
}: Props) {
  const [balanceData, setBalanceData] =
    useState<BalanceOverTimeDataPoint[]>(initialBalanceData);
  const [transactionData, setTransactionData] =
    useState<MonthlyTransactionDataPoint[]>(initialTransactionData);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateRangeChange = async (
    startDate: string | null,
    endDate: string | null,
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const [balanceResponse, transactionResponse] = await Promise.all([
        fetch(`/api/account-balance/${accountId}?${params}`),
        fetch(`/api/account-transactions/${accountId}?${params}`),
      ]);

      const [balanceData, transactionData] = await Promise.all([
        balanceResponse.json(),
        transactionResponse.json(),
      ]);

      setBalanceData(balanceData);
      setTransactionData(transactionData);
    } catch (error) {
      console.error("Failed to fetch filtered data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const minDate =
    initialBalanceData.length > 0 ? initialBalanceData[0].date : undefined;
  const maxDate =
    initialBalanceData.length > 0
      ? initialBalanceData[initialBalanceData.length - 1].date
      : undefined;

  return (
    <section style={{ marginTop: "24px" }} aria-label="Account visualizations">
      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "750",
              margin: "0 0 16px",
            }}
          >
            Balance Over Time
          </h3>
          <DateRangeFilter
            onDateRangeChange={handleDateRangeChange}
            minDate={minDate}
            maxDate={maxDate}
          />
          {isLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "300px",
                color: "var(--text-muted)",
              }}
            >
              Loading...
            </div>
          ) : (
            <AccountBalanceChart data={balanceData} />
          )}
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "750",
              margin: "0 0 16px",
            }}
          >
            Monthly Transaction Activity
          </h3>
          {!isLoading && (
            <div style={{ height: "60px" }}>
              {/* Empty space for alignment with other chart */}
            </div>
          )}
          {isLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "300px",
                color: "var(--text-muted)",
              }}
            >
              Loading...
            </div>
          ) : (
            <TransactionActivityChart data={transactionData} />
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 720px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
