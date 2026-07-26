"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BalanceOverTimeDataPoint } from "@/db/summaries";

type Props = {
  data: BalanceOverTimeDataPoint[];
};

export function BalanceOverTimeChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }

  // Sample data to show fewer points on x-axis
  const sampledData =
    data.length > 30
      ? data.filter((_, i) => i % Math.ceil(data.length / 30) === 0)
      : data;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          tickLine={false}
          ticks={sampledData.map((d) => d.date)}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
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
            const date = new Date(String(label));
            return date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
          }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#balanceGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
