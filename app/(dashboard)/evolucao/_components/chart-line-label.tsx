"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface EvolucaoChartItem {
  date: string;
  score: number;
}

interface EvolucaoChartProps {
  data?: EvolucaoChartItem[];
}

export function EvolucaoChart({ data }: EvolucaoChartProps) {
  const hasData = Boolean(data && data.length > 0);

  if (!hasData) {
    return (
      <div className="flex h-[320px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
        <TrendingUp className="size-10 text-muted-foreground" />
        <h4 className="font-semibold text-gray-800">
          Nenhum histórico de evolução disponível
        </h4>
        <p className="max-w-sm text-xs text-muted-foreground">
          Realize seus diagnósticos para que a curva de evolução da sustentabilidade seja traçada neste gráfico.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
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
            stroke="var(--color-card-green)"
            strokeWidth={2}
            dot={{
              fill: "var(--color-card-green)",
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
              className="fill-foreground font-semibold"
              fontSize={12}
            />
          </Line>

          <XAxis
            type="category"
            dataKey="date"
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
      </ResponsiveContainer>
    </div>
  );
}
