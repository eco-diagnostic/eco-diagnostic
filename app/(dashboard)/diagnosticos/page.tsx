import { Button } from "@/app/_components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/app/_components/ui/input-group";
import { FilterIcon, PlusIcon, SearchIcon, FileText } from "lucide-react";
import { columns, Diagnostic } from "./_components/columns";
import { DataTable } from "../_components/data-table";
import { prisma } from "@/app/_lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getData(): Promise<Diagnostic[]> {
  const diagnostics = await prisma.diagnostic.findMany({
    include: {
      institution: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return diagnostics.map((d) => ({
    id: d.id,
    data: new Date(d.createdAt).toLocaleDateString("pt-BR"),
    instituição: d.institution?.name || "Minha Instituição",
    indice: String(Math.round(d.overallScore ?? 0)),
    status:
      d.status === "CONCLUIDO"
        ? "Concluído"
        : d.status === "EM_ANDAMENTO"
        ? "Em andamento"
        : d.status === "EM_ANALISE"
        ? "Em análise"
        : "Pendente",
    ações: d.id,
  }));
}

const PageDiagnosticos = async () => {
  const data = await getData();

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Diagnósticos</h1>
        <span className="text-muted-foreground">
          Gerencie e acompanhe todos os diagnósticos da sua instituição.
        </span>
      </div>

      <div className="flex gap-2">
        <InputGroup className="max-w-[400px]">
          <InputGroupInput
            id="input-group-url"
            placeholder="Buscar diagnóstico"
          />
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Button className="text-muted-foreground" variant="outline">
          <FilterIcon />
          Filtros
        </Button>
        <Link href="/questionarios">
          <Button>
            <PlusIcon />
            Novo diagnóstico
          </Button>
        </Link>
      </div>

      <div className="py-4">
        {data.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <FileText className="size-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-gray-800">
              Nenhum diagnóstico encontrado
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Sua instituição ainda não realizou nenhum diagnóstico de sustentabilidade.
            </p>
            <Link href="/questionarios">
              <Button className="mt-2">
                <PlusIcon className="mr-2 size-4" />
                Iniciar Primeiro Diagnóstico
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageDiagnosticos;
