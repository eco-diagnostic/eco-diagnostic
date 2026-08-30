const CardEvolutActually = () => {
  return (
    <div className="bg-card-green/10 border-primary/30 flex max-w-[250px] flex-col justify-center rounded-2xl border border-solid p-4">
      <p className="font-bold">Diagnóstico Atual</p>
      <p className="text-sm">15/05/2025</p>
      <div className="text-primary">
        <span className="text-4xl font-bold">64</span>
        <span className="ml-3 text-xl font-bold">/ 100</span>
      </div>
    </div>
  );
};

export default CardEvolutActually;
