'use client'

import { useState, useEffect } from 'react'
import { Question } from '@/lib/questions'
import QuestionCard from './QuestionCard'
import ProgressBar from './ProgressBar'

interface QuestionnaireProps {
  token: string;
  questions: Question[];
  initialAnswers: Record<string, string>;
  onComplete: () => void;
}

export default function Questionnaire({
  token,
  questions,
  initialAnswers,
  onComplete,
}: QuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.number.toString()]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAnswerSelect = (letter: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.number.toString()]: letter,
    }))
    setError(null)
  }

  const saveAnswer = async (questionId: string, answer: string) => {
    try {
      const response = await fetch(`/api/test/${token}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      throw err
    }
  }

  const handleNext = async () => {
    if (!currentAnswer) {
      setError('Veuillez sélectionner une réponse')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Save the answer
      await saveAnswer(currentQuestion.number.toString(), currentAnswer)

      if (isLastQuestion) {
        // Complete the test
        const response = await fetch(`/api/test/${token}/complete`, {
          method: 'POST',
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Erreur lors de la finalisation')
        }

        onComplete()
      } else {
        // Move to next question
        setCurrentQuestionIndex((prev) => prev + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      setError(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <ProgressBar
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={currentAnswer || null}
        onAnswerSelect={handleAnswerSelect}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
          className="px-6 py-2 border-2 border-it2p-sand text-it2p-text rounded-lg hover:bg-it2p-sand-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          ← Précédent
        </button>

        <button
          onClick={handleNext}
          disabled={!currentAnswer || isSubmitting}
          className="px-6 py-2 bg-it2p-accent text-white rounded-lg hover:bg-it2p-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting
            ? 'Enregistrement...'
            : isLastQuestion
            ? 'Terminer le test'
            : 'Suivant →'}
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-it2p-text-secondary">
        {Object.keys(answers).length} / {questions.length} questions répondues
      </div>
    </div>
  )
}
