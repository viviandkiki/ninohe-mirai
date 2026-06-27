"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/lib/schemas";

interface MiniTrendChartProps {
  data: TrendPoint[];
  unit?: string;
  color?: string;
}

export default function MiniTrendChart({ data, unit = "", color = "#0d9488" }: MiniTrendChartProps) {
  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const padding = (max - min) * 0.2 || 1;

  return (
    <div className="w-full h-24" data-fade>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <XAxis
            dataKey="year"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[min - padding, max + padding]}
            hide
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString("ja-JP")} ${unit}`, ""]}
            labelFormatter={(label) => `${label}年`}
            contentStyle={{
              fontSize: 11,
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: "4px 8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 4 }}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
