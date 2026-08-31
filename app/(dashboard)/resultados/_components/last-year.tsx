interface CardLastYearProps {
  average?: number | null;
}

const CardLastYear = ({ average }: CardLastYearProps) => {
  const hasAverage = typeof average === "number";

  return (
    <div className="card-dots card-dots-blue bg-card-blue flex flex-col gap-3 rounded-lg p-4 text-white">
      <p>Média Geral</p>
      <div>
        {hasAverage ? (
          <>
            <span className="text-4xl font-bold">{average}</span>
            <span className="ml-3 text-xl">/ 100</span>
          </>
        ) : (
          <span className="text-2xl font-bold">--</span>
        )}
      </div>
      <p className="text-sm">
        {hasAverage ? "Últimos 12 meses" : "Sem histórico nos últimos 12 meses"}
      </p>
    </div>
  );
};

export default CardLastYear;
