"use client";

import { Label, Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/app/_components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/_components/ui/chart";

export const description = "A simple pie chart";

const chartData = [
  {
    area: "energia",
    porcentagem: 82,
    fill: "var(--color-energia)",
  },
  {
    area: "agua",
    porcentagem: 68,
    fill: "var(--color-agua)",
  },
  {
    area: "residuos",
    porcentagem: 41,
    fill: "var(--color-residuos)",
  },
  {
    area: "materiais",
    porcentagem: 57,
    fill: "var(--color-materiais)",
  },
  {
    area: "gestao",
    porcentagem: 72,
    fill: "var(--color-gestao)",
  },
];

const chartConfig = {
  porcentagem: {
    label: "Porcentagem",
  },
  energia: {
    label: "Energia",
    color: "var(--color-card-green)",
  },
  agua: {
    label: "Água",
    color: "var(--color-card-blue)",
  },
  residuos: {
    label: "Resíduos",
    color: "var(--color-card-orange)",
  },
  materiais: {
    label: "Materiais",
    color: "var(--color-card-purple)",
  },
  gestao: {
    label: "Gestão",
    color: "var(--color-card-mint)",
  },
} satisfies ChartConfig;

export function ChartPieSimple() {
  const indiceGeral = Math.round(
    chartData.reduce((total, item) => total + item.porcentagem, 0) /
      chartData.length,
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[250px]">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <PieChart>
          <ChartTooltip cursor={false} formatter={(value) => `${value}%`} />

          <Pie
            data={chartData}
            dataKey="porcentagem"
            nameKey="area"
            innerRadius={60}
          />
        </PieChart>
      </ChartContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-green-700">
          {indiceGeral}%
        </span>

        <span className="text-xs text-gray-500">Índice geral</span>
      </div>
    </div>
  );
}
