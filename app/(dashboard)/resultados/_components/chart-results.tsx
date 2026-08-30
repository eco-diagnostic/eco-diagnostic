"use client";

import { Pie, PieChart } from "recharts";

import { ChartContainer, type ChartConfig } from "@/app/_components/ui/chart";

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--color-card-green)",
  },
  restante: {
    label: "Restante",
    color: "#ffffff",
  },
} satisfies ChartConfig;

interface ChartResultsProps {
  total: number;
}

export function ChartResults({ total }: ChartResultsProps) {
  const totalLimitado = Math.min(100, Math.max(0, total));

  const chartData = [
    {
      name: "total",
      value: totalLimitado,
      fill: "var(--color-total)",
    },
    {
      name: "restante",
      value: 100 - totalLimitado,
      fill: "var(--color-restante)",
    },
  ];

  return (
    <div className="relative aspect-square h-full w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="65%"
            outerRadius="80%"
            startAngle={90}
            endAngle={-270}
            stroke="transparent"
          />
        </PieChart>
      </ChartContainer>

      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl font-bold text-green-700">
        {totalLimitado}%
      </span>
    </div>
  );
}
