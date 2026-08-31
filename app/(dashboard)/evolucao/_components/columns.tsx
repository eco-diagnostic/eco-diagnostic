"use client";

import { createColumnHelper } from "@tanstack/react-table";

import { type DataTableFeatures } from "../../_components/data-table-features";
import {
  ArrowDownRight,
  ArrowUpRight,
  BatteryCharging,
  Boxes,
  BriefcaseBusiness,
  Droplets,
  Recycle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/app/_lib/utils";

export type EvolucaoArea = {
  area: string;
  inicial: number;
  atual: number;
};

const areaConfig: Record<string, { icon: LucideIcon; className: string }> = {
  Energia: {
    icon: BatteryCharging,
    className: "bg-amber-100 text-amber-600 border-amber-200",
  },
  Água: {
    icon: Droplets,
    className: "bg-sky-100 text-sky-600 border-sky-200",
  },
  Resíduos: {
    icon: Recycle,
    className: "bg-emerald-100 text-emerald-600 border-emerald-200",
  },
  Materiais: {
    icon: Boxes,
    className: "bg-violet-100 text-violet-600 border-violet-200",
  },
  Gestão: {
    icon: BriefcaseBusiness,
    className: "bg-rose-100 text-rose-600 border-rose-200",
  },
};

export const evolucaoData: EvolucaoArea[] = [];

const columnHelper = createColumnHelper<DataTableFeatures, EvolucaoArea>();

export const columns = columnHelper.columns([
  columnHelper.accessor("area", {
    header: "Área",
    cell: (info) => {
      const area = info.getValue();
      const config = areaConfig[area] ?? {
        icon: BriefcaseBusiness,
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };

      const Icon = config.icon;

      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md border",
              config.className,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>

          <span className="font-medium">{area}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("inicial", {
    header: "Inicial",
    cell: (info) => `${info.getValue()}%`,
  }),
  columnHelper.accessor("atual", {
    header: "Atual",
    cell: (info) => `${info.getValue()}%`,
  }),
  columnHelper.accessor("atual", {
    id: "variacao",
    header: "Variação",
    cell: (info) => {
      const inicial = Number(info.row.original.inicial);
      const atual = Number(info.getValue());
      const variacao = inicial > 0 ? ((atual - inicial) / inicial) * 100 : (atual - inicial);
      const isPositive = variacao >= 0;
      const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 font-medium",
            isPositive ? "text-emerald-600" : "text-red-600",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {Math.abs(variacao).toFixed(1)}%
        </span>
      );
    },
  }),
]);
