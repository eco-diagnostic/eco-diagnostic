const CardLastDiag = () => {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-[#1B6C23] p-4 text-white">
      <p>Último Diagnóstico</p>
      <div>
        <span className="text-4xl font-bold">64</span>
        <span className="ml-3 text-xl">/ 100</span>
      </div>
      <p className="text-sm">Realizado em 15/05/2026</p>
    </div>
  );
};

export default CardLastDiag;
