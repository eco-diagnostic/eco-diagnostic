interface CardTotalDiagnoProps {
  total?: number;
}

const CardTotalDiagno = ({ total = 0 }: CardTotalDiagnoProps) => {
  return (
    <div className="card-dots card-dots-purple bg-card-purple flex flex-col gap-3 rounded-lg p-4 text-white">
      <p>Total de resultados</p>
      <div>
        <span className="text-4xl font-bold">{total}</span>
      </div>
      <p className="text-sm">
        {total > 0 ? "Diagnósticos concluídos" : "Nenhum diagnóstico registrado"}
      </p>
    </div>
  );
};

export default CardTotalDiagno;
