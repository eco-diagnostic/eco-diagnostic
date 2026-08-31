interface CardAverageEvolutionProps {
  trend?: string | null;
  diagnosticsCount?: number;
}

const CardAverageEvolution = ({
  trend,
  diagnosticsCount = 0,
}: CardAverageEvolutionProps) => {
  return (
    <div className="bg-card-green/10 border-primary/30 flex max-w-[250px] flex-col justify-center rounded-2xl border border-solid p-4">
      <h1 className="font-medium">Tendência de Evolução</h1>
      <h1 className="text-lg font-bold">{trend || "Sem dados"}</h1>
      <p className="text-2xl-foreground font-medium text-gray-600">
        {diagnosticsCount > 0
          ? `${diagnosticsCount} diagnósticos`
          : "Aguardando diagnósticos"}
      </p>
    </div>
  );
};

export default CardAverageEvolution;
