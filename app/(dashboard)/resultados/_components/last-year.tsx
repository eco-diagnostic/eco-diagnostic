const CardLastYear = () => {
  return (
    <div className="card-dots card-dots-blue bg-card-blue flex flex-col gap-3 rounded-lg p-4 text-white">
      <p>Média Geral</p>
      <div>
        <span className="text-4xl font-bold">45</span>
        <span className="ml-3 text-xl">/ 100</span>
      </div>
      <p className="text-sm">Últimos 12 meses</p>
    </div>
  );
};

export default CardLastYear;
