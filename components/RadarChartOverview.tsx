"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface RadarDataPoint {
  subject: string;
  score: number;
  fullMark: number;
}

interface RadarChartOverviewProps {
  data: RadarDataPoint[];
  className?: string;
}

export default function RadarChartOverview({ data, className = "" }: RadarChartOverviewProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#e5e1da" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <Radar
            name="スコア"
            dataKey="score"
            stroke="#2e7d8c"
            fill="#2e7d8c"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ r: 3, fill: "#2e7d8c", fillOpacity: 1 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
