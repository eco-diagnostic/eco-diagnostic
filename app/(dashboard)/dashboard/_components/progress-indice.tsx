interface ProgressItem {
  label: string;
  value: number;
  color?: string;
}

const emptyProgressData: ProgressItem[] = [
  { value: 0, label: "Energia", color: "var(--color-card-green)" },
  { value: 0, label: "Água", color: "var(--color-card-blue)" },
  { value: 0, label: "Resíduos", color: "var(--color-card-orange)" },
  { value: 0, label: "Materiais", color: "var(--color-card-purple)" },
  { value: 0, label: "Gestão", color: "var(--color-card-mint)" },
];

const pillarColors: Record<string, string> = {
  Energia: "var(--color-card-green)",
  Água: "var(--color-card-blue)",
  Resíduos: "var(--color-card-orange)",
  Materiais: "var(--color-card-purple)",
  Gestão: "var(--color-card-mint)",
};

interface ProgressIndiceProps {
  data?: ProgressItem[];
}

export function ProgressIndice({ data }: ProgressIndiceProps) {
  const hasData = Boolean(data && data.length > 0);
  const items = hasData ? (data as ProgressItem[]) : emptyProgressData;

  return (
    <div className="space-y-4">
      {!hasData && (
        <p className="text-xs text-muted-foreground">
          Nenhum diagnóstico registrado. Valores em 0%.
        </p>
      )}

      {items.map((progress) => (
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
                backgroundColor:
                  progress.color ||
                  pillarColors[progress.label] ||
                  "var(--color-card-green)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
