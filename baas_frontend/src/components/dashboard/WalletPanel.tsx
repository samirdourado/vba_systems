import { ChevronDown, Eye, EyeOff, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getTransactions, getWallet } from '../../services/walletService'
import {
  formatCentsToBRL,
  formatDateBR,
  getStatusBadgeClasses,
  normalizeTransactionStatus,
  normalizeTransactionType,
} from '../../utils/formatters'

type WalletResponse = {
  balance?: number
  transactions?: Array<{
    id?: string
    externalReference?: string
    paymentMethod?: string
    status?: string
    createdAt?: string
    amount?: number
    amountFormatted?: string
  }>
}

export function WalletPanel() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletResponse['transactions']>([])
  const [loading, setLoading] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [limit, setLimit] = useState('50')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')

  const loadTransactions = async (nextLimit = limit, nextStatus = status, nextType = type) => {
    try {
      const list = (await getTransactions({
        limit: nextLimit ? Number(nextLimit) : undefined,
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(nextType ? { type: nextType } : {}),
      })) as WalletResponse

      setTransactions(list?.transactions ?? [])
    } catch (error) {
      console.error('Erro ao carregar carteira', error)
      setTransactions([])
    }
  }

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const wallet = (await getWallet()) as WalletResponse

        if (!mounted) {
          return
        }

        setBalance(Math.round(Number(wallet?.balance ?? 0) * 100))
        await loadTransactions()
      } catch (error) {
        console.error('Erro ao carregar carteira', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (loading) {
      return
    }

    void loadTransactions()
  }, [limit, status, type])

  const balanceText = loading ? 'Carregando...' : showValues ? formatCentsToBRL(balance) : 'R$ •••••••'

  const formatCardTitle = (value?: string) => {
    if (!value) {
      return 'Pagamento'
    }

    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#a855f7]/15 p-2 text-[#d8b4fe]">
              <Wallet size={18} />
            </div>
            <p className="text-sm text-[#cbd5e1]">Saldo</p>
          </div>

          <button
            type="button"
            onClick={() => setShowValues((current) => !current)}
            aria-label={showValues ? 'Ocultar valores' : 'Mostrar valores'}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-black/10 p-2 text-[#e2e8f0] transition hover:border-[#a855f7]/60 hover:text-[#d8b4fe]"
          >
            {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <h3 className="text-4xl font-bold text-white">{balanceText}</h3>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <h3 className="text-xl font-bold text-white">Extrato</h3>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="min-w-30">
              <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-[#cbd5e1]">Exibir</span>
              <input
                type="number"
                min="1"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                placeholder="6"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-[#94a3b8] focus:border-[#a855f7] focus:outline-none"
              />
            </label>

            <label className="min-w-37.5">
              <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-[#cbd5e1]">Status</span>
              <div className="relative">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 pr-9 text-sm text-white focus:border-[#a855f7] focus:outline-none"
                >
                  <option value="">Todos</option>
                  <option value="APPROVED">Aprovado</option>
                  <option value="DENIED">Rejeitado</option>
                  <option value="PENDING">Pendente</option>
                  <option value="EXPIRED">Expirado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#cbd5e1]" size={16} />
              </div>
            </label>

            <label className="min-w-45">
              <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-[#cbd5e1]">Tipo</span>
              <div className="relative">
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 pr-9 text-sm text-white focus:border-[#a855f7] focus:outline-none"
                >
                  <option value="">Todos</option>
                  <option value="PIX">Pix</option>
                  <option value="CREDIT_CARD">Cartão de crédito</option>
                  <option value="WITHDRAWAL">Saque</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#cbd5e1]" size={16} />
              </div>
            </label>
          </div>
        </div>

        {(!transactions || transactions.length === 0) ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 text-sm text-[#cbd5e1]">
            Nenhuma movimentação encontrada.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id || `${transaction.paymentMethod}-${transaction.createdAt}`}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="max-w-full truncate text-sm font-medium text-white sm:text-base">
                      {formatCardTitle(transaction.externalReference || transaction.paymentMethod || 'Pagamento')}
                    </p>
                    <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusBadgeClasses(transaction.status)}`}>
                      {normalizeTransactionStatus(transaction.status)}
                    </span>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-[#a1a1aa]">
                    <span className="truncate">{normalizeTransactionType(transaction.paymentMethod)}</span>
                    <span>•</span>
                    <span className="shrink-0">{formatDateBR(transaction.createdAt)}</span>
                  </p>
                </div>

                <div className="shrink-0 md:min-w-45 md:text-right">
                  <span className="font-semibold text-[#e9d5ff]">
                    {showValues
                      ? transaction.amountFormatted || formatCentsToBRL(Number(transaction.amount || 0))
                      : 'R$ •••••'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
