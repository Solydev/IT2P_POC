'use client'

import { Question } from '@/lib/questions'
import LexiqueTooltip from './LexiqueTooltip'

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onAnswerSelect: (letter: string) => void;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
}: QuestionCardProps) {
  return (
    <div className="bg-a2p-surface rounded-lg shadow-sm border border-a2p-sand p-8">
      <div className="mb-6">
        <h2 className="text-xl font-serif font-semibold text-a2p-text leading-relaxed">
          {question.text}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <label
            key={option.letter}
            className={`
              block p-4 rounded-lg border-2 cursor-pointer transition-all
              ${
                selectedAnswer === option.letter
                  ? 'border-a2p-accent bg-blue-50'
                  : 'border-a2p-sand hover:border-a2p-accent/50 hover:bg-a2p-sand-light/30'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name={`question-${question.number}`}
                value={option.letter}
                checked={selectedAnswer === option.letter}
                onChange={() => onAnswerSelect(option.letter)}
                className="mt-1 w-4 h-4 text-a2p-accent focus:ring-a2p-accent"
              />
              <div className="flex-1">
                <span className="font-semibold text-a2p-accent mr-2">
                  {option.letter}.
                </span>
                <span className="text-a2p-text">
                  {option.text}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {question.lexique && question.lexique.length > 0 && (
        <LexiqueTooltip entries={question.lexique} />
      )}
    </div>
  )
}
