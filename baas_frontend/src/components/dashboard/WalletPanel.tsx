import { Eye, EyeOff, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getTransactions, getWallet } from '../../services/walletService'
import { formatCentsToBRL } from '../../utils/formatters'

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

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const wallet = (await getWallet()) as WalletResponse
        const list = (await getTransactions({ limit: 6 })) as WalletResponse

        if (!mounted) {
          return
        }

        setBalance(Number(wallet?.balance ?? 0))
        setTransactions(list?.transactions ?? [])
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

  const balanceText = loading ? 'Carregando...' : showValues ? formatCentsToBRL(balance) : 'R$ •••••••'

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
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-white">Extrato</h3>
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
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {transaction.externalReference || transaction.paymentMethod || 'Pagamento'}
                  </p>
                  <p className="text-xs text-[#a1a1aa]">
                    {transaction.status || 'processando'} • {transaction.createdAt || 'recentemente'}
                  </p>
                </div>
                <span className="font-semibold text-[#e9d5ff]">
                  {showValues
                    ? transaction.amountFormatted || formatCentsToBRL(Number(transaction.amount || 0))
                    : 'R$ •••••'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
