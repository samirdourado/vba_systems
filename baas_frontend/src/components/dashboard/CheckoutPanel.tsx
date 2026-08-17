import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createCheckoutLink, getFees } from '../../services/checkoutService'
import { PixPayment } from '../checkout/PixPayment'
import { CardPayment } from '../checkout/CardPayment'
import { CheckoutResultCard } from '../checkout/CheckoutResultCard'

type FeeOption = {
  installments?: number
  feePercent?: number
}

type CheckoutLinkResult = {
  message?: string
  checkoutId?: string
  id?: string
  url?: string
}

export function CheckoutPanel() {
  const [amount, setAmount] = useState('100')
  const [payerDocument, setPayerDocument] = useState('')
  const [description, setDescription] = useState('Pagamento de teste')
  const [fees, setFees] = useState<any[]>([])
  const [link, setLink] = useState<any>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'PIX' | 'CARD'>('PIX')
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null)

  useEffect(() => {
    const loadFees = async () => {
      try {
        const response = (await getFees()) as { fees?: FeeOption[] } | FeeOption[]
        setFees(Array.isArray(response) ? response : response?.fees ?? [])
      } catch (error) {
        console.error('Erro ao carregar taxas', error)
      }
    }

    void loadFees()
  }, [])

  const handleCreateLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const result = (await createCheckoutLink({
        amount: Math.round(Number(amount) * 100),
        payerDocument,
        description,
        externalReference: `CHECKOUT-${Date.now()}`,
      })) as CheckoutLinkResult

      setLink(result)
      setPaymentSuccessData(null) // Reset payment state on new link
      setMessage(result?.message || 'Link de pagamento criado com sucesso.')
    } catch (requestError: any) {
      const nextMessage =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Não foi possível criar o link de cobrança.'

      setError(nextMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (data: any) => {
    setPaymentSuccessData(data)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-2xl font-bold text-white">Gerar checkout</h3>

        {message && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateLink} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Valor</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">CPF / CNPJ do pagador</label>
            <input
              type="text"
              value={payerDocument}
              onChange={(event) => setPayerDocument(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-4 py-3 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Criando link...
                </>
              ) : (
                'Criar link de pagamento'
              )}
            </button>
          </div>
        </form>
      </div>

      {fees.length > 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h4 className="text-lg font-bold text-white">Taxas e parcelas</h4>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {fees.slice(0, 4).map((fee) => (
              <div key={`${fee.installments}-${fee.feePercent}`} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-sm text-[#cbd5e1]">{fee.installments}x</p>
                <p className="mt-2 text-lg font-bold text-white">{fee.feePercent ?? 0}%</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {link && !paymentSuccessData ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <h4 className="text-xl font-bold text-white mb-6">Simular Pagamento (Preview)</h4>

          <div className="mb-8 flex rounded-xl bg-black/40 p-1 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('PIX')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${activeTab === 'PIX'
                ? 'bg-white text-black shadow-md'
                : 'text-[#9ca3af] hover:text-white'
                }`}
            >
              Pix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CARD')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${activeTab === 'CARD'
                ? 'bg-white text-black shadow-md'
                : 'text-[#9ca3af] hover:text-white'
                }`}
            >
              Cartão de Crédito
            </button>
          </div>

          <div className="max-w-md mx-auto">
            {activeTab === 'PIX' ? (
              <PixPayment
                amount={Math.round(Number(amount || 0) * 100)}
                description={description}
                externalReference={link.externalReference || `CHECKOUT-${Date.now()}`}
                onSuccess={handlePaymentSuccess}
              />
            ) : (
              <CardPayment
                amount={Math.round(Number(amount || 0) * 100)}
                description={description}
                externalReference={link.externalReference || `CHECKOUT-${Date.now()}`}
                onSuccess={handlePaymentSuccess}
              />
            )}
          </div>
        </div>
      ) : null}

      {paymentSuccessData ? (
        <div className="mt-8">
          <CheckoutResultCard
            id={paymentSuccessData.id || paymentSuccessData.checkoutId || `CHK-${Date.now()}`}
            amount={Math.round(Number(amount || 0) * 100)}
            status={paymentSuccessData.status || 'APPROVED'}
            paymentMethod={activeTab}
            brand={paymentSuccessData.gatewayResponse?.metadata?.cardBrand || 'VISA'}
            installments={paymentSuccessData.gatewayResponse?.metadata?.installments || 1}
          />
        </div>
      ) : null}
    </section>
  )
}
