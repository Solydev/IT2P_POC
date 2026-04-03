'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Question } from '@/lib/questions'
import { INTRO_TEXT } from '@/lib/questions'
import Questionnaire from '@/components/Questionnaire'

type TestState = 'loading' | 'error' | 'intro' | 'questionnaire' | 'completed'

interface SessionData {
  session: {
    id: string
    token: string
    status: string
    patientName: string | null
    expiresAt: string | null
  }
  questions: Question[]
  answers: Record<string, string>
}

export default function TestPage() {
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<TestState>('loading')
  const [error, setError] = useState<string>('')
  const [sessionData, setSessionData] = useState<SessionData | null>(null)

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await fetch(`/api/test/${token}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 404) {
            setError('Token invalide. Veuillez vérifier le lien que vous avez reçu.')
          } else if (response.status === 410) {
            if (data.status === 'EXPIRED') {
              setError('Ce test a expiré. Veuillez contacter votre praticien pour obtenir un nouveau lien.')
            } else if (data.status === 'COMPLETED') {
              setError('Ce test a déjà été complété. Merci pour votre participation.')
            }
          } else {
            setError(data.error || 'Une erreur est survenue')
          }
          setState('error')
          return
        }

        setSessionData(data)
        setState('intro')
      } catch (err) {
        setError('Impossible de charger le test. Veuillez réessayer.')
        setState('error')
      }
    }

    fetchTestData()
  }, [token])

  const handleStart = () => {
    setState('questionnaire')
  }

  const handleComplete = () => {
    setState('completed')
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-it2p-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-it2p-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-it2p-text-secondary">Chargement du test...</p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-it2p-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-it2p-surface rounded-lg shadow-lg border border-it2p-sand p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-it2p-text mb-4">
            Erreur
          </h2>
          <p className="text-it2p-text-secondary mb-6">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (state === 'intro' && sessionData) {
    return (
      <div className="min-h-screen bg-it2p-bg">
        {/* Header with timer (coming soon) */}
        <div className="bg-it2p-surface border-b border-it2p-sand">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-it2p-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                IT2P
              </div>
              <span className="font-serif text-lg text-it2p-text">Institut IA2P</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 cursor-not-allowed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-sm">30:00</span>
              <span className="text-xs">(À venir)</span>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-it2p-surface rounded-lg shadow-lg border border-it2p-sand p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-it2p-accent rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
                IT2P
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-it2p-text mb-3">
                {INTRO_TEXT.title}
              </h1>
              {sessionData.session.patientName && (
                <p className="text-it2p-text-secondary text-lg">
                  Bienvenue, {sessionData.session.patientName}
                </p>
              )}
            </div>

            <div className="space-y-6 text-it2p-text leading-relaxed">
              <p className="text-lg">
                {INTRO_TEXT.preambule}
              </p>

              <div className="border-t border-it2p-sand pt-6">
                <h2 className="font-serif font-semibold text-xl mb-3">Instructions</h2>
                <div className="whitespace-pre-line text-it2p-text-secondary">
                  {INTRO_TEXT.instructions}
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-it2p-accent text-white rounded-lg hover:bg-it2p-accent-hover transition-colors font-medium text-lg shadow-md"
              >
                {INTRO_TEXT.startButton}
              </button>
            </div>

            {sessionData.session.expiresAt && (
              <p className="mt-6 text-center text-sm text-it2p-text-secondary">
                Ce test expire le{' '}
                {new Date(sessionData.session.expiresAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (state === 'questionnaire' && sessionData) {
    return (
      <div className="min-h-screen bg-it2p-bg">
        {/* Header with timer */}
        <div className="bg-it2p-surface border-b border-it2p-sand">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-it2p-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                IT2P
              </div>
              <span className="font-serif text-lg text-it2p-text">Test A2P</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 cursor-not-allowed">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-sm">30:00</span>
              <span className="text-xs">(À venir)</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-8">
          <Questionnaire
            token={token}
            questions={sessionData.questions}
            initialAnswers={sessionData.answers}
            onComplete={handleComplete}
          />
        </div>
      </div>
    )
  }

  if (state === 'completed') {
    return (
      <div className="min-h-screen bg-it2p-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-it2p-surface rounded-lg shadow-lg border border-it2p-sand p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-it2p-text mb-4">
            Test Complété !
          </h2>
          <p className="text-it2p-text-secondary mb-6">
            Merci d&apos;avoir complété le test A2P. Vos réponses ont été enregistrées avec succès.
          </p>
          <p className="text-sm text-it2p-text-secondary">
            Votre praticien analysera vos résultats et vous contactera prochainement pour discuter de votre profil professionnel.
          </p>
        </div>
      </div>
    )
  }

  return null
}
