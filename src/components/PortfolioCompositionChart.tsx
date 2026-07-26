"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PortfolioDataPoint } from "@/db/summaries";

type Props = {
  data: PortfolioDataPoint[];
};

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export function PortfolioCompositionChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={(entry) => {
            const percent = ((entry.value / total) * 100).toFixed(1);
            return `${entry.name} (${percent}%)`;
          }}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
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
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          formatter={(value, entry: any) => {
            const percent = ((entry.payload.value / total) * 100).toFixed(1);
            return `${value} (${percent}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
