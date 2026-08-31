interface CardHighEvolutionProps {
  pillarName?: string | null;
  points?: number | null;
}

const CardHighEvolution = ({
  pillarName,
  points,
}: CardHighEvolutionProps) => {
  const hasData = Boolean(pillarName && typeof points === "number");
  const isPositive = (points ?? 0) >= 0;
  const signal = isPositive ? "+" : "";

  return (
    <div className="bg-card-green/10 border-primary/30 flex max-w-[250px] flex-col justify-center rounded-2xl border border-solid p-4">
      <h1 className="font-medium">Maior evolução</h1>
      <h1 className="text-lg font-bold">{pillarName || "Nenhum"}</h1>
      <p className="text-primary text-2xl font-medium">
        {hasData ? `${signal} ${points} pontos` : "--"}
      </p>
    </div>
  );
};

export default CardHighEvolution;
