interface CardEvolutIndiceProps {
  points?: number | null;
  percentage?: number | null;
}

const CardEvolutIndice = ({ points, percentage }: CardEvolutIndiceProps) => {
  const hasPoints = typeof points === "number";
  const isPositivePoints = (points ?? 0) >= 0;
  const isPositivePercent = (percentage ?? 0) >= 0;
  const pointSignal = isPositivePoints ? "+" : "";
  const percentSignal = isPositivePercent ? "+" : "";

  return (
    <div className="bg-card-blue/10 border-card-blue/30 flex max-w-[250px] flex-col justify-center rounded-2xl border border-solid p-4">
      <p className="font-bold">Evolução do índice</p>
      <div className="text-blue-500">
        {hasPoints ? (
          <span className="text-4xl font-bold">
            {pointSignal}
            {points} pontos
          </span>
        ) : (
          <span className="text-2xl font-bold">--</span>
        )}
      </div>
      <p className="font-bold text-blue-500">
        {typeof percentage === "number"
          ? `${percentSignal} ${Math.abs(percentage).toFixed(1)}%`
          : "Sem variação"}
      </p>
    </div>
  );
};

export default CardEvolutIndice;
