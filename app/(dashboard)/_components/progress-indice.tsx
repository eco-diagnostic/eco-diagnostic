const progressData = [
  {
    value: 82,
    label: "Energia",
    color: "#1B6C23", // Verde
  },
  {
    value: 68,
    label: "Água",
    color: "#2B74A8", // Azul
  },
  {
    value: 41,
    label: "Resíduos",
    color: "#EF9D15", // Laranja
  },
  {
    value: 57,
    label: "Materiais",
    color: "#6959AA", // Roxo
  },
  {
    value: 72,
    label: "Gestão",
    color: "#34D399", // Cor atual
  },
];
export function ProgressIndice() {
  return (
    <div className="space-y-4">
      {progressData.map((progress) => (
        <div key={progress.label} className="w-full max-w-sm">
          <div className="mb-2 flex justify-between text-sm">
            <span>{progress.label}</span>
            <span>{progress.value}%</span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={progress.value}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 overflow-hidden rounded-full bg-gray-200"
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress.value}%`,
                backgroundColor: progress.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
