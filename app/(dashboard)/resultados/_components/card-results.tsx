"use client";

import { Button } from "@/app/_components/ui/button";
import { ChartResults } from "./chart-results";
import { redirect } from "next/navigation";

interface CardsResultsProps {
  date: string;
  institution: string;
  status: string;
  total: number;
  id: number;
}

const CardResults = ({
  date,
  id,
  institution,
  status,
  total,
}: CardsResultsProps) => {
  const handleClick = () => {
    redirect(`/resultados/${id}`);
  };
  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-solid border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <div className="size-48">
          <ChartResults total={total} />
        </div>
        <div className="flex flex-col">
          <span>{date}</span>
          <span className="text-bold">{institution}</span>
          <span className="text-muted-foreground">{status}</span>
        </div>
      </div>

      <div className="">
        <Button onClick={handleClick}>Ver detalhes</Button>
      </div>
    </div>
  );
};

export default CardResults;
