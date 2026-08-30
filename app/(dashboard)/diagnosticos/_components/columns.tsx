"use client";
import { Badge } from "@/app/_components/ui/badge";
import { createColumnHelper } from "@tanstack/react-table";

import { type DataTableFeatures } from "../../_components/data-table-features";
import { Eye, PencilIcon, Trash } from "lucide-react";
import { Button } from "@/app/_components/ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Diagnostic = {
  id: string;
  data: string;
  instituição: string;
  indice: string;
  status: string;
  ações: string;
};

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Diagnostic>();

export const columns = columnHelper.columns([
  columnHelper.accessor("data", {
    header: "Data",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("instituição", {
    header: "Instituição",
  }),
  columnHelper.accessor("indice", {
    header: "Indice",
    cell: (info) => {
      const value = Number(info.getValue() ?? 0);

      return (
        <span className="inline-flex items-center gap-1 font-medium tabular-nums">
          <span className="font-bold text-slate-800">{value}</span>
          <span className="text-slate-400">/100</span>
        </span>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: () => <span className="font-bold text-slate-900">Status</span>,
    cell: (info) => {
      const status = String(info.getValue() ?? "");

      const colorMap: Record<string, string> = {
        Concluído: "bg-emerald-100 text-emerald-700 border-emerald-200",
        "Em andamento": "bg-red-100 text-red-700 border-red-200",
        Pendente: "bg-yellow-100 text-yellow-700 border-yellow-200",
        "Em análise": "bg-blue-100 text-blue-700 border-blue-200",
      };

      return (
        <Badge
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
            colorMap[status] ?? "border-slate-200 bg-slate-100 text-slate-700"
          }`}
        >
          {status}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("ações", {
    header: "Ações",
    cell: () => {
      return (
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 border-slate-300 text-slate-500" />
          </Button>
          <Button variant="outline">
            <PencilIcon className="h-4 w-4 text-blue-500" />
          </Button>
          <Button variant="outline">
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      );
    },
  }),
]);
