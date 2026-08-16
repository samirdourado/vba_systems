import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface RegisterProps {
  onSwitchMode: () => void
  onSuccess: () => void
}

type RegisterForm = {
  personType: 'PF' | 'PJ'
  name: string
  tradingName: string
  email: string
  phone: string
  document: string
  password: string
  zipCode: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

const initialForm: RegisterForm = {
  personType: 'PF',
  name: '',
  tradingName: '',
  email: '',
  phone: '',
  document: '',
  password: '',
  zipCode: '',
  address: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
}

export function RegisterPage({ onSwitchMode, onSuccess }: RegisterProps) {
  const { register } = useAuth()
  const [form, setForm] = useState<RegisterForm>(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = <K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register({
        ...form,
        tradingName: form.tradingName || undefined,
        complement: form.complement || undefined,
      })
      onSuccess()
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível realizar o cadastro.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(170,59,255,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,189,89,0.14),transparent_22%),linear-gradient(135deg,#000000_0%,#0f172a_35%,#020617_100%)] px-4 py-10 text-white">
      <div className="w-full max-w-3xl rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8">
        <div className="mb-8 text-center">
          <img src="/logo.webp" alt="BAAS" className="mx-auto h-[42px] w-[180px] object-contain" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#c084fc]">Cadastro</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Abra sua conta</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Tipo de pessoa</label>
            <select
              value={form.personType}
              onChange={(event) => handleChange('personType', event.target.value as 'PF' | 'PJ')}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            >
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Nome fantasia</label>
            <input
              type="text"
              value={form.tradingName}
              onChange={(event) => handleChange('tradingName', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Telefone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">CPF / CNPJ</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.document}
              onChange={(event) => handleChange('document', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">CEP</label>
            <input
              type="text"
              value={form.zipCode}
              onChange={(event) => handleChange('zipCode', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Rua</label>
            <input
              type="text"
              value={form.address}
              onChange={(event) => handleChange('address', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Número</label>
            <input
              type="text"
              value={form.number}
              onChange={(event) => handleChange('number', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Complemento</label>
            <input
              type="text"
              value={form.complement}
              onChange={(event) => handleChange('complement', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Bairro</label>
            <input
              type="text"
              value={form.neighborhood}
              onChange={(event) => handleChange('neighborhood', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Cidade</label>
            <input
              type="text"
              value={form.city}
              onChange={(event) => handleChange('city', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Estado</label>
            <input
              type="text"
              value={form.state}
              onChange={(event) => handleChange('state', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          {error ? (
            <div className="md:col-span-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-4 py-3 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-[#cbd5e1]">
          Já possui conta?{' '}
          <button
            type="button"
            onClick={onSwitchMode}
            className="font-semibold text-[#c084fc] underline underline-offset-2"
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  )
}
