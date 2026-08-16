import { LoaderCircle, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { api } from '../services/api'

interface ForgotPasswordProps {
  onBackToLogin: () => void
}

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordProps) {
  const [document, setDocument] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await api.post('/auth/reset-password', {
        document,
        email,
      })

      const rawMessage = response.data?.message || 'Nova senha foi enviada para o seu e-mail.'
      const formattedMessage = rawMessage
        .replace(/Use-a em POST \/api\/auth\/login\./gi, 'Volte para o login no botão abaixo.')
        .replace(/\s+Volte para o login no botão abaixo\./gi, ' Volte para o login no botão abaixo.')

      setMessage(
        formattedMessage || 'Nova senha gerada e enviada para o e-mail cadastrado. Volte para o login no botão abaixo.'
      )
    } catch (requestError: any) {
      const nextMessage =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Não foi possível redefinir a senha neste momento.'

      setError(nextMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(170,59,255,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,189,89,0.14),transparent_22%),linear-gradient(135deg,#000000_0%,#0f172a_35%,#020617_100%)] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8">
        <div className="mb-8 flex items-center justify-center">
          <img src="/logo.webp" alt="BAAS" className="h-10.5 w-45 object-contain" />
        </div>

        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c084fc]">Recuperação</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Esqueci minha senha</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="document" className="mb-2 block text-sm font-medium text-[#d1d5db]">
              CPF ou CNPJ
            </label>
            <input
              id="document"
              type="text"
              inputMode="numeric"
              value={document}
              onChange={(event) => setDocument(event.target.value)}
              placeholder="Digite apenas números"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#d1d5db]">
              E-mail cadastrado
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              <MailCheck size={16} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          ) : null}

          {!message ? (
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-4 py-3 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar nova senha'
              )}
            </button>
          ) : (
            <div className="mt-4 text-center">
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  onBackToLogin()
                }}
                className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-5 py-3 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Voltar para o login
              </a>
            </div>
          )}
        </form>

        {!message ? (
          <div className="mt-6 text-center text-sm text-[#cbd5e1]">
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault()
                onBackToLogin()
              }}
              className="font-semibold text-[#c084fc] underline underline-offset-2"
            >
              Voltar para o login
            </a>
          </div>
        ) : null}
      </section>
    </main>
  )
}
