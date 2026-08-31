interface CardEvolutionProps {
  delta?: number | null;
  periodLabel?: string;
}

const CardEvolution = ({
  delta,
  periodLabel = "Sem histórico anterior",
}: CardEvolutionProps) => {
  const hasDelta = typeof delta === "number";
  const isPositive = (delta ?? 0) >= 0;
  const signal = isPositive ? "+" : "";

  return (
    <div className="card-dots card-dots-purple bg-card-purple flex flex-col gap-3 rounded-lg p-4 text-white">
      <p>Evolução</p>
      <div>
        {hasDelta ? (
          <>
            <span className="text-4xl font-bold">
              {signal}
              {delta}
            </span>
            <span className="ml-3 text-xl">pontos</span>
          </>
        ) : (
          <span className="text-2xl font-bold">--</span>
        )}
      </div>
      <p className="text-sm">{periodLabel}</p>
    </div>
  );
};

export default CardEvolution;
