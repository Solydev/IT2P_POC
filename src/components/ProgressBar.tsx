interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function ProgressBar({ currentQuestion, totalQuestions }: ProgressBarProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-it2p-text">
          Question {currentQuestion} / {totalQuestions}
        </span>
        <span className="text-sm text-it2p-text-secondary">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-it2p-sand-light rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-it2p-accent h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
