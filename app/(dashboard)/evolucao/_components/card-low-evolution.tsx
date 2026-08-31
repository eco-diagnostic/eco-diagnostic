interface CardLowEvolutionProps {
  pillarName?: string | null;
  diagnosticsCount?: number;
}

const CardLowEvolution = ({
  pillarName,
  diagnosticsCount = 0,
}: CardLowEvolutionProps) => {
  return (
    <div className="bg-card-orange/10 border-card-orange/30 flex max-w-[250px] flex-col justify-center rounded-2xl border border-solid p-4">
      <h1 className="font-medium">Menor evolução</h1>
      <h1 className="text-lg font-bold">{pillarName || "Nenhum"}</h1>
      <p className="text-2xl-foreground font-medium text-gray-600">
        {diagnosticsCount > 0
          ? `${diagnosticsCount} diagnósticos`
          : "Nenhum diagnóstico"}
      </p>
    </div>
  );
};

export default CardLowEvolution;
