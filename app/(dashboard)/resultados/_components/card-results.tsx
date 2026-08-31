"use client";

import { Button } from "@/app/_components/ui/button";
import { ChartResults } from "./chart-results";
import Link from "next/link";

interface CardsResultsProps {
  id: string;
  date: string;
  institution: string;
  status: string;
  total: number;
}

const CardResults = ({
  id,
  date,
  institution,
  status,
  total,
}: CardsResultsProps) => {
  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-solid border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <div className="size-48">
          <ChartResults total={total} />
        </div>
        <div className="flex flex-col">
          <span>{date}</span>
          <span className="font-bold">{institution}</span>
          <span className="text-muted-foreground">{status}</span>
        </div>
      </div>

      <div>
        <Link href={`/resultados/${id}`}>
          <Button>Ver detalhes</Button>
        </Link>
      </div>
    </div>
  );
};

export default CardResults;
