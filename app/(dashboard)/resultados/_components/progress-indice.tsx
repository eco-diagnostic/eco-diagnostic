const progressData = [
  {
    value: 14,
    label: "Energia",
    color: "var(--color-card-green)",
  },
  {
    value: 75,
    label: "Água",
    color: "var(--color-card-blue)",
  },
  {
    value: 65,
    label: "Resíduos",
    color: "var(--color-card-orange)",
  },
  {
    value: 35,
    label: "Materiais",
    color: "var(--color-card-purple)",
  },
  {
    value: 54,
    label: "Gestão",
    color: "var(--color-card-mint)",
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
