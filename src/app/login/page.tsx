'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la connexion')
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Erreur de connexion au serveur')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-a2p-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-a2p-accent text-white text-xl font-serif font-bold mb-4 shadow-md">
            A2P
          </div>
          <h1 className="text-2xl font-serif font-bold text-a2p-text">
            Espace Praticien
          </h1>
          <p className="text-sm text-a2p-text-secondary mt-1">
            Institut IA2P
          </p>
        </div>

        {/* Card */}
        <div className="bg-a2p-surface rounded-xl border border-a2p-sand/50 shadow-lg p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>

            {error && (
              <div className="rounded-lg bg-a2p-error/8 border border-a2p-error/20 px-4 py-3 text-sm text-a2p-error">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-a2p-text mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-a2p-sand rounded-lg bg-a2p-bg text-a2p-text placeholder-a2p-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-a2p-accent/30 focus:border-a2p-accent transition-colors"
                placeholder="votre@email.fr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-a2p-text mb-1.5">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-a2p-sand rounded-lg bg-a2p-bg text-a2p-text focus:outline-none focus:ring-2 focus:ring-a2p-accent/30 focus:border-a2p-accent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-a2p-accent hover:bg-a2p-accent-hover focus:outline-none focus:ring-2 focus:ring-a2p-accent/40 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-a2p-text-secondary mt-6">
          Prototype — accès réservé
        </p>

      </div>
    </div>
  )
}
