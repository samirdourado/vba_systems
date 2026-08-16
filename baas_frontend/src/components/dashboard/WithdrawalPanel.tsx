import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { getWithdrawalStatus, requestWithdrawal } from '../../services/walletService'

type WithdrawalResult = {
  message?: string
  id?: string
  withdrawalId?: string
}

type WithdrawalStatusResult = {
  status?: string
}

export function WithdrawalPanel() {
  const [amount, setAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<string>('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setStatus('')
    setLoading(true)

    try {
      const value = Number(amount)
      if (!value || value <= 0) {
        throw new Error('Informe um valor válido para o saque.')
      }

      if (!pixKey.trim()) {
        throw new Error('Informe a chave PIX de destino.')
      }

      const result = (await requestWithdrawal({
        amount: Math.round(value * 100),
        pixKey: pixKey.trim(),
      })) as WithdrawalResult
      setMessage(result?.message || 'Solicitação de saque enviada com sucesso.')

      const withdrawalId = result?.id || result?.withdrawalId
      if (withdrawalId) {
        const details = (await getWithdrawalStatus(String(withdrawalId))) as WithdrawalStatusResult
        setStatus(details?.status || 'Em análise')
      }
    } catch (requestError: any) {
      const nextMessage =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Não foi possível solicitar o saque.'

      setError(nextMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <h3 className="text-2xl font-bold text-white">Solicitar saque</h3>
      <p className="mt-2 text-sm text-[#cbd5e1]">
        Informe o valor em reais que deseja sacar da sua conta.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="amount" className="mb-2 block text-sm font-medium text-[#d1d5db]">
            Valor do saque
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="250.00"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="pixKey" className="mb-2 block text-sm font-medium text-[#d1d5db]">
            Chave PIX
          </label>
          <input
            id="pixKey"
            type="text"
            value={pixKey}
            onChange={(event) => setPixKey(event.target.value)}
            placeholder="chave pix ou e-mail"
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
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}

        {status ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Status da solicitação: {status}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-4 py-3 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Solicitando...
            </>
          ) : (
            'Solicitar saque'
          )}
        </button>
      </form>
    </section>
  )
}
