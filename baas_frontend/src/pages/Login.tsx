import { Check, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface LoginProps {
  onSwitchMode: () => void
  onForgotPassword: () => void
}

export function LoginPage({ onSwitchMode, onForgotPassword }: LoginProps) {
  const { login } = useAuth()
  const [document, setDocument] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await login(document, password)
      setSuccess(true)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível entrar. Verifique seus dados.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(170,59,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,189,89,0.16),transparent_24%),linear-gradient(135deg,#000000_0%,#000000_35%,#0f172a_100%)] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8">
        <div className="mb-8 flex items-center justify-center">
          <img src="/logo.webp" alt="BAAS" className="h-[42px] w-[180px] object-contain" />
        </div>

        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c084fc]">Acesso</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Entrar na conta</h1>
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
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#d1d5db]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200">
              <Check size={16} />
              Login realizado com sucesso!
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || success}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-4 py-3 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Entrando...
              </>
            ) : success ? (
              <>
                <Check size={18} />
                Login realizado
              </>
            ) : (
              'Fazer login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#cbd5e1]">
          <div className="mb-3">
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault()
                onForgotPassword()
              }}
              className="font-semibold text-[#c084fc] underline underline-offset-2"
            >
              Esqueci minha senha
            </a>
          </div>

          Ainda não possui conta?{' '}
          <button
            type="button"
            onClick={onSwitchMode}
            className="font-semibold text-[#c084fc] underline underline-offset-2"
          >
            Cadastrar-se
          </button>
        </div>
      </div>
    </div>
  )
}
