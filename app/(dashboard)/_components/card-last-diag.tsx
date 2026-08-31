interface CardLastDiagProps {
  score?: number | null;
  date?: string | null;
}

const CardLastDiag = ({ score, date }: CardLastDiagProps) => {
  const hasScore = typeof score === "number";

  return (
    <div className="card-dots card-dots-green bg-card-green flex flex-col gap-3 rounded-lg p-4 text-white">
      <p>Último Diagnóstico</p>
      <div>
        {hasScore ? (
          <>
            <span className="text-4xl font-bold">{score}</span>
            <span className="ml-3 text-xl">/ 100</span>
          </>
        ) : (
          <span className="text-2xl font-bold">Sem diagnóstico</span>
        )}
      </div>
      <p className="text-sm">
        {date ? `Realizado em ${date}` : "Nenhum diagnóstico realizado ainda"}
      </p>
    </div>
  );
};

export default CardLastDiag;
