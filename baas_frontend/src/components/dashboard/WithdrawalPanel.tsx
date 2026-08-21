import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getWithdrawalStatus, requestWithdrawal } from '../../services/walletService'
import { parseAmountToCents } from '../../utils/currencyFormatter'

type WithdrawalMetadata = {
  pixKey?: string
  document?: string
  externalReference?: string
  ChaveLoja?: string
  CodigoCliente?: number | string
  [key: string]: unknown
}

type WithdrawalResult = {
  message?: string
  id?: string
  withdrawalId?: string
  status?: string
  amount?: number
  amountFormatted?: string
  walletBalance?: number
  walletBalanceFormatted?: string
  externalReference?: string
  description?: string
  metadata?: WithdrawalMetadata
  createdAt?: string
}

type WithdrawalStatusResult = WithdrawalResult

const normalizeWithdrawalStatus = (status?: string) => {
  const map: Record<string, string> = {
    APPROVED: 'Aprovado',
    DENIED: 'Rejeitado',
    PENDING: 'Pendente',
    EXPIRED: 'Expirado',
    CANCELLED: 'Cancelado',
  }

  return map[(status || '').toUpperCase()] || 'Pendente'
}

export const formatAmountInputValue = (value: string): string => {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  const amount = Number(digits) / 100;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const getStatusClassName = (status?: string) => {
  const normalized = (status || '').toUpperCase()

  switch (normalized) {
    case 'APPROVED':
      return 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
    case 'DENIED':
      return 'border border-red-500/40 bg-red-500/10 text-red-200'
    case 'PENDING':
      return 'border border-amber-500/40 bg-amber-500/10 text-amber-200'
    case 'EXPIRED':
      return 'border border-orange-500/40 bg-orange-500/10 text-orange-200'
    case 'CANCELLED':
      return 'border border-slate-500/40 bg-slate-500/10 text-slate-200'
    default:
      return 'border border-white/10 bg-white/5 text-slate-200'
  }
}

export function WithdrawalPanel() {
  const [amount, setAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [description, setDescription] = useState('')
  const [externalReference, setExternalReference] = useState('')
  const [document, setDocument] = useState('')
  const [lookupId, setLookupId] = useState('')
  const [loading, setLoading] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<string>('')
  const [result, setResult] = useState<WithdrawalStatusResult | null>(null)
  const [lookupResult, setLookupResult] = useState<WithdrawalStatusResult | null>(null)

  useEffect(() => {
    if (!message && !status) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setMessage('')
      setStatus('')
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [message, status])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setStatus('')
    setResult(null)
    setLoading(true)

    try {
      const amountInCents = parseAmountToCents(amount)

      if (!amountInCents || amountInCents <= 0) {
        throw new Error('Informe um valor válido para o saque.')
      }

      if (!pixKey.trim()) {
        throw new Error('Informe a chave PIX de destino.')
      }

      const payload = {
        amount: amountInCents,
        pixKey: pixKey.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(externalReference.trim() ? { externalReference: externalReference.trim() } : {}),
        ...(document.trim() ? { document: document.trim() } : {}),
      }

      const response = (await requestWithdrawal(payload)) as WithdrawalResult
      const nextResult = (await getWithdrawalStatus(String(response.id))) as WithdrawalStatusResult
      const mergedResult = {
        ...nextResult,
        ...response,
        metadata: {
          ...(nextResult?.metadata || {}),
          ...(response?.metadata || {}),
        },
      } as WithdrawalStatusResult

      setMessage(response?.message || nextResult?.message || 'Solicitação de saque enviada com sucesso.')
      setStatus(normalizeWithdrawalStatus(mergedResult?.status || response?.status))
      setResult(mergedResult)
      setLookupResult(null)
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

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setStatus('')
    setResult(null)
    setLookupResult(null)
    setLookupLoading(true)

    try {
      if (!lookupId.trim()) {
        throw new Error('Informe o ID da solicitação de saque.')
      }

      const response = (await getWithdrawalStatus(lookupId.trim())) as WithdrawalStatusResult
      setLookupResult(response)
      setResult(null)
    } catch (requestError: any) {
      const nextMessage =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Não foi possível consultar o saque.'

      setError(nextMessage)
    } finally {
      setLookupLoading(false)
    }
  }

  const displayReference = result?.externalReference || result?.metadata?.externalReference || '—'

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Solicitar saque</h3>
          <p className="mt-2 text-sm text-[#cbd5e1]">
            Informe o valor em reais e a chave PIX para realizar a solicitação.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="amount" className="mb-2 block text-sm font-medium text-[#d1d5db]">
              Valor do saque
            </label>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(formatAmountInputValue(event.target.value))}
              placeholder="Digite o valor do saque"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="document" className="mb-2 block text-sm font-medium text-[#d1d5db]">
              CPF / CNPJ do titular
            </label>
            <input
              id="document"
              type="text"
              value={document}
              onChange={(event) => setDocument(event.target.value)}
              placeholder="Digite o CPF ou CNPJ do titular"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="pixKey" className="mb-2 block text-sm font-medium text-[#d1d5db]">
              Chave PIX
            </label>
            <input
              id="pixKey"
              type="text"
              value={pixKey}
              onChange={(event) => setPixKey(event.target.value)}
              placeholder="Digite a chave PIX"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-[#d1d5db]">
              Descrição
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Informe uma descrição para o saque."
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="externalReference" className="mb-2 block text-sm font-medium text-[#d1d5db]">
              Referência externa
            </label>
            <input
              id="externalReference"
              type="text"
              value={externalReference}
              onChange={(event) => setExternalReference(event.target.value)}
              placeholder="Informe um nome para referência externa."
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
            />
          </div>
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
          <div className={`rounded-xl px-3 py-2 text-sm ${getStatusClassName(status)}`}>
            Status da solicitação: {status}
          </div>
        ) : null}

        {result ? (
          <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-3 text-sm text-[#e2e8f0]">
            <p><span className="text-[#cbd5e1]">ID:</span> {result.id}</p>
            <p><span className="text-[#cbd5e1]">Valor:</span> {result.amountFormatted || '—'}</p>
            <p><span className="text-[#cbd5e1]">Referência:</span> {displayReference}</p>
            <p><span className="text-[#cbd5e1]">Descrição:</span> {result.description || '—'}</p>
            <p><span className="text-[#cbd5e1]">Data:</span> {result.createdAt ? new Date(result.createdAt).toLocaleString('pt-BR') : '—'}</p>
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
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h4 className="text-xl font-bold text-white">Consultar saque por ID</h4>
        <p className="mt-2 text-sm text-[#cbd5e1]">
          Insira o identificador da solicitação para verificar o status atual.
        </p>

        <form onSubmit={handleLookup} className="mt-4 space-y-4">
          <div>
            <label htmlFor="lookupId" className="mb-2 block text-sm font-medium text-[#d1d5db]">
              ID da solicitação
            </label>
            <input
              id="lookupId"
              type="text"
              value={lookupId}
              onChange={(event) => setLookupId(event.target.value)}
              placeholder="Digite o ID da solicitação de saque"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={lookupLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-base font-bold text-white transition hover:border-[#a855f7]/60 hover:text-[#d8b4fe] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {lookupLoading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Consultando...
              </>
            ) : (
              'Consultar saque'
            )}
          </button>

          {lookupLoading ? (
            <div className="mt-4 animate-pulse space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="h-6 w-24 rounded-full bg-white/10" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-20 rounded-2xl bg-white/5" />
                <div className="h-20 rounded-2xl bg-white/5" />
                <div className="h-20 rounded-2xl bg-white/5 sm:col-span-2" />
                <div className="h-20 rounded-2xl bg-white/5 sm:col-span-2" />
              </div>
            </div>
          ) : null}

          {lookupResult ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_45px_rgba(0,0,0,0.28)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">
                  Saque
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClassName(lookupResult.status)}`}>
                  {normalizeWithdrawalStatus(lookupResult.status)}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#94a3b8]">ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-white">{lookupResult.id || '—'}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#94a3b8]">Valor</p>
                  <p className="mt-2 text-sm font-medium text-white">{lookupResult.amountFormatted || '—'}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-3 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#94a3b8]">Referência</p>
                  <p className="mt-2 break-all text-sm font-medium text-white">{lookupResult.externalReference || lookupResult.metadata?.externalReference || '—'}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-3 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#94a3b8]">Descrição</p>
                  <p className="mt-2 text-sm font-medium text-white">{lookupResult.description || '—'}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-3 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#94a3b8]">Data</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {lookupResult.createdAt ? new Date(lookupResult.createdAt).toLocaleString('pt-BR') : '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  )
}
