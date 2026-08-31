interface CardAreaCriticProps {
  pillarName?: string | null;
  description?: string;
}

const CardAreaCritic = ({
  pillarName,
  description = "Pilar que necessita de maior atenção",
}: CardAreaCriticProps) => {
  return (
    <div className="card-dots card-dots-orange bg-card-orange flex flex-col gap-3 rounded-lg p-4 text-white">
      <p>Áreas Críticas</p>
      <div>
        <span className={pillarName ? "text-4xl font-bold" : "text-2xl font-bold"}>
          {pillarName || "Nenhuma"}
        </span>
      </div>
      <p className="text-sm">
        {pillarName ? description : "Sem diagnósticos para avaliar áreas críticas"}
      </p>
    </div>
  );
};

export default CardAreaCritic;
