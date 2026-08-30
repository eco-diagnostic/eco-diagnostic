"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  Line,
  XAxis,
  YAxis,
} from "recharts";

const chartData = [
  { date: "10/01/2024", score: 72 },
  { date: "18/01/2024", score: 85 },
  { date: "02/02/2024", score: 64 },
  { date: "15/02/2024", score: 90 },
  { date: "01/03/2024", score: 100 },
];

export function EvolucaoChart() {
  return (
    <AreaChart
      data={chartData}
      width="100%"
      height={400}
      margin={{ top: 16, right: 12, bottom: 8, left: 12 }}
    >
      <defs>
        <linearGradient id="scoreFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.08} />
        </linearGradient>
      </defs>

      <CartesianGrid strokeDasharray="3 3" vertical={false} />

      <Line
        dataKey="score"
        type="monotone"
        stroke="var(--color-desktop)"
        strokeWidth={2}
        dot={{
          fill: "var(--color-desktop)",
          r: 4,
        }}
        activeDot={{
          r: 6,
        }}
      >
        <LabelList
          dataKey="score"
          position="top"
          offset={12}
          className="fill-foreground"
          fontSize={12}
        />
      </Line>

      <XAxis
        type="category"
        dataKey="date"
        width={90}
        axisLine={false}
        tickLine={false}
        tickMargin={8}
      />

      <YAxis
        type="number"
        dataKey="score"
        domain={[0, 100]}
        ticks={[0, 25, 50, 75, 100]}
        axisLine={false}
        tickLine={false}
        tickMargin={8}
      />

      <Area
        type="monotone"
        dataKey="score"
        stroke="var(--primary)"
        strokeWidth={3}
        fill="url(#scoreFill)"
        dot={{ r: 4, fill: "var(--primary)" }}
        activeDot={{ r: 6, fill: "var(--primary)" }}
      />
    </AreaChart>
  );
}
