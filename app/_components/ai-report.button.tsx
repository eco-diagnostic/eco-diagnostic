"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Button, buttonVariants } from "@/app/_components/ui/button";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { generateAiReport } from "@/app/(dashboard)/_actions/generate-ai-report.ts";
import { BotIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import { cn } from "@/app/_lib/utils";

interface AiReportButtonProps {
  diagnosticId?: string;
  month?: string;
  initialPlan?: {
    content: string;
    summary?: string | null;
  } | null;
  className?: string;
  buttonLabel?: string;
  dialogTitle?: string;
  dialogDescription?: string;
}

export const AiReportButton = ({
  diagnosticId,
  month,
  initialPlan,
  className,
  buttonLabel,
  dialogTitle,
  dialogDescription,
}: AiReportButtonProps) => {
  const [report, setReport] = useState<string | undefined>(
    initialPlan?.content || undefined
  );
  const [reportIsLoading, setReportIsLoading] = useState(false);

  const handleGenerateReportClick = async () => {
    try {
      setReportIsLoading(true);
      const res = await generateAiReport({
        diagnosticId,
        month,
      });
      setReport(res.content);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setReportIsLoading(false);
    }
  };

  const defaultLabel =
    buttonLabel ||
    (month
      ? report
        ? "Ver Análise dos 30 Dias (IA)"
        : "Análise dos 30 Dias (IA)"
      : report
        ? "Ver Relatório IA"
        : "Relatório IA");

  const defaultTitle =
    dialogTitle ||
    (month
      ? "Relatório Consolidado de Evolução (IA)"
      : "Relatório IA do Diagnóstico");

  const defaultDescription =
    dialogDescription ||
    (month
      ? "Análise comparativa e plano estratégico de evolução dos diagnósticos recentes."
      : "Análise com descrição do diagnóstico, pontos de atenção e plano estratégico.");

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "border-primary text-primary hover:bg-primary/20 hover:text-primary cursor-pointer gap-2",
          className
        )}
      >
        <BotIcon className="size-4" />
        {defaultLabel}
      </DialogTrigger>

      <DialogContent className="max-w-[650px] w-full max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <BotIcon className="size-5 text-primary" />
            {defaultTitle}
          </DialogTitle>
          <DialogDescription>{defaultDescription}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="my-2 max-h-[450px] overflow-y-auto rounded-md border p-4 text-sm leading-relaxed">
          {report ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{report}</Markdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
              <BotIcon className="size-10 opacity-50" />
              <p>Nenhum relatório gerado ainda para este período.</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <DialogClose
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "cursor-pointer"
            )}
          >
            Fechar
          </DialogClose>
          <Button
            onClick={handleGenerateReportClick}
            disabled={reportIsLoading}
            className="cursor-pointer"
          >
            {reportIsLoading && (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            )}
            {report ? "Regenerar Relatório" : "Gerar Relatório"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiReportButton;


