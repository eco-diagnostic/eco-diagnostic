interface PreogressQuestionsProps {
  totalQuestions: number;
  answeredQuestions: number;
}

export function ProgressQuestions({
  totalQuestions,
  answeredQuestions,
}: PreogressQuestionsProps) {
  const progressPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100,
  );

  return (
    <div className="space-y-4">
      <div className="w-full">
        <div className="mb-2 flex justify-between text-sm">
          <span>
            {answeredQuestions}/{totalQuestions}
          </span>
          <span>{progressPercentage}%</span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 overflow-hidden rounded-full bg-gray-200"
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: "#1b6c23",
            }}
          />
        </div>
      </div>
    </div>
  );
}
