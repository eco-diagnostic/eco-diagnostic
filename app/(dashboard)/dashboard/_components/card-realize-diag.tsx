import Link from "next/link";

interface CardRealizeDiagProps {
  total?: number;
}

const CardRealizeDiag = ({ total = 0 }: CardRealizeDiagProps) => {
  return (
    <div className="card-dots card-dots-blue bg-card-blue flex flex-col gap-3 rounded-lg p-4 text-white">
      <p>Diagnósticos Realizados</p>
      <div>
        <span className="text-4xl font-bold">{total}</span>
      </div>
      <Link href="/diagnosticos" className="hover:underline">
        <p className="text-sm">
          {total > 0 ? "Ver histórico" : "Nenhum diagnóstico registrado"}
        </p>
      </Link>
    </div>
  );
};

export default CardRealizeDiag;
