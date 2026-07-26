"use client";

import { useState } from "react";
import { BalanceOverTimeChart } from "./BalanceOverTimeChart";
import { PortfolioCompositionChart } from "./PortfolioCompositionChart";
import { DateRangeFilter } from "./DateRangeFilter";
import type {
  BalanceOverTimeDataPoint,
  PortfolioDataPoint,
} from "@/db/summaries";

type Props = {
  initialBalanceData: BalanceOverTimeDataPoint[];
  portfolioData: PortfolioDataPoint[];
};

export function DashboardChartsSection({
  initialBalanceData,
  portfolioData,
}: Props) {
  const [balanceData, setBalanceData] =
    useState<BalanceOverTimeDataPoint[]>(initialBalanceData);
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

      const response = await fetch(`/api/dashboard-balance?${params}`);
      const data = await response.json();
      setBalanceData(data);
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
    <section style={{ marginTop: "32px" }} aria-label="Financial charts">
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
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "750",
              margin: "0 0 16px",
            }}
          >
            Total Balance Over Time
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
            <BalanceOverTimeChart data={balanceData} />
          )}
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "750",
              margin: "0 0 20px",
            }}
          >
            Portfolio Composition
          </h3>
          <PortfolioCompositionChart data={portfolioData} />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
