interface CardEvolutInitProps {
  score?: number | null;
  date?: string | null;
}

const CardEvolutInit = ({ score, date }: CardEvolutInitProps) => {
  const hasScore = typeof score === "number";

  return (
    <div className="bg-card-green/10 border-primary/30 flex max-w-[250px] flex-col justify-center rounded-2xl border border-solid p-4">
      <p className="font-bold">Diagnóstico Inicial</p>
      <p className="text-sm">{date || "Sem registro inicial"}</p>
      <div className="text-primary">
        {hasScore ? (
          <>
            <span className="text-4xl font-bold">{score}</span>
            <span className="ml-3 text-xl font-bold">/ 100</span>
          </>
        ) : (
          <span className="text-2xl font-bold">--</span>
        )}
      </div>
    </div>
  );
};

export default CardEvolutInit;
