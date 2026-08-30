import { Button } from "@/app/_components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/app/_components/ui/input-group";
import { FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
import { columns, Diagnostic } from "./_components/columns";
import { DataTable } from "../_components/data-table";

async function getData(): Promise<Diagnostic[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      data: "15/05/2024",
      instituição: "Instituição Exemplo",
      indice: "64",
      status: "Concluído",
      ações: "Ver detalhes",
    },
    {
      id: "728ed52g",
      data: "10/04/2024",
      instituição: "Outra Instituição",
      indice: "75",
      status: "Em andamento",
      ações: "Ver detalhes",
    },
    {
      id: "728ed52h",
      data: "20/06/2024",
      instituição: "Terceira Instituição",
      indice: "80",
      status: "Pendente",
      ações: "Ver detalhes",
    },
    {
      id: "728ed52i",
      data: "05/07/2024",
      instituição: "Quarta Instituição",
      indice: "90",
      status: "Concluído",
      ações: "Ver detalhes",
    },
  ];
}
const PageDiagnosticos = async () => {
  const data = await getData();

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Diagnósticos</h1>
        <span className="text-muted-foreground">
          Gerencie e acompanhe todos os diagnósticos da sia instituição.
        </span>
      </div>

      <div className="flex gap-2">
        <InputGroup className="max-w-[400px]">
          <InputGroupInput
            id="input-group-url"
            placeholder="Buscar diagnóstico"
          />
          {/* <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon> */}
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Button className="text-muted-foreground" variant="outline">
          <FilterIcon />
          Filtros
        </Button>
        <Button>
          <PlusIcon />
          Novo diagnóstico
        </Button>
      </div>

      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default PageDiagnosticos;
