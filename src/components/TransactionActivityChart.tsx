"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyTransactionDataPoint } from "@/db/summaries";

type Props = {
  data: MonthlyTransactionDataPoint[];
};

export function TransactionActivityChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No transactions yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          tickLine={false}
          tickFormatter={(value) => {
            const [year, month] = value.split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString("en-US", {
              month: "short",
              year: data.length > 12 ? "2-digit" : undefined,
            });
          }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          tickLine={false}
          tickFormatter={(value) =>
            `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
          formatter={(value) =>
            `$${Number(value || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          }
          labelFormatter={(label) => {
            if (!label) return "";
            const [year, month] = String(label).split("-");
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
        <Bar dataKey="deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="withdrawals" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
