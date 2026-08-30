const CardEvolution = () => {
  return (
    <div className="card-dots card-dots-purple bg-card-purple flex flex-col gap-3 rounded-lg p-4 text-white">
      <p>Evolução</p>
      <div>
        <span className="text-4xl font-bold">+12</span>
        <span className="ml-3 text-xl">pontos</span>
      </div>
      <p className="text-sm">Últimos 60 dias</p>
    </div>
  );
};

export default CardEvolution;
