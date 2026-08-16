import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createCheckoutLink, getFees, payCard, payPix } from '../../services/checkoutService'
import { formatCentsToBRL } from '../../utils/formatters'

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
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    installments: '1',
  })

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

  const handlePixPayment = async () => {
    try {
      setPaymentLoading(true)
      setError('')
      const response = (await payPix({
        amount: Math.round(Number(amount || 0) * 100),
        payerDocument,
        description,
        externalReference: `CHECKOUT-${Date.now()}`,
      })) as { checkoutId?: string; copyPaste?: string; qrCodeBase64?: string; message?: string }

      setLink(response)
      setMessage(response?.message || 'Cobrança Pix gerada com sucesso.')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Não foi possível gerar o Pix.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleCardPayment = async () => {
    try {
      setPaymentLoading(true)
      setError('')
      const response = (await payCard({
        amount: Math.round(Number(amount || 0) * 100),
        installments: Number(cardData.installments),
        feePercent: Number(fees[0]?.feePercent ?? 0),
        cardNumber: cardData.cardNumber,
        cardHolder: cardData.cardHolder,
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        cvv: cardData.cvv,
        description,
        externalReference: `CHECKOUT-${Date.now()}`,
      })) as { message?: string, status?: string }

      setMessage(response?.message || 'Pagamento com cartão realizado com sucesso.')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Não foi possível processar o pagamento com cartão.')
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-2xl font-bold text-white">Gerar checkout</h3>

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

      {link ? (
        <div className="rounded-[28px] border border-emerald-500/30 bg-emerald-500/5 p-6">
          <h4 className="text-lg font-bold text-white">Link gerado</h4>
          <p className="mt-3 break-all rounded-xl border border-emerald-500/20 bg-black/10 p-3 text-sm text-emerald-100">
            {link.url || link.checkoutId || 'Link disponível'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePixPayment}
              disabled={paymentLoading}
              className="rounded-xl border border-[#a855f7] bg-[#a855f7]/15 px-4 py-2 font-semibold text-white"
            >
              Pagar com Pix
            </button>
            <button
              type="button"
              onClick={handleCardPayment}
              disabled={paymentLoading}
              className="rounded-xl border border-[#34d399] bg-[#34d399]/15 px-4 py-2 font-semibold text-white"
            >
              Pagar com cartão
            </button>
          </div>
        </div>
      ) : null}

      {link ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h4 className="text-lg font-bold text-white">Dados do cartão</h4>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Número do cartão"
              value={cardData.cardNumber}
              onChange={(event) => setCardData((current) => ({ ...current, cardNumber: event.target.value }))}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Nome no cartão"
              value={cardData.cardHolder}
              onChange={(event) => setCardData((current) => ({ ...current, cardHolder: event.target.value }))}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="MM"
              value={cardData.expiryMonth}
              onChange={(event) => setCardData((current) => ({ ...current, expiryMonth: event.target.value }))}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="AAAA"
              value={cardData.expiryYear}
              onChange={(event) => setCardData((current) => ({ ...current, expiryYear: event.target.value }))}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            />
            <input
              type="text"
              placeholder="CVV"
              value={cardData.cvv}
              onChange={(event) => setCardData((current) => ({ ...current, cvv: event.target.value }))}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            />
            <input
              type="number"
              min="1"
              max="12"
              placeholder="Parcelas"
              value={cardData.installments}
              onChange={(event) => setCardData((current) => ({ ...current, installments: event.target.value }))}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            />
          </div>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {link ? (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-[#cbd5e1]">Valor estimado</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatCentsToBRL(Number(amount || 0) * 100)}</p>
        </div>
      ) : null}
    </section>
  )
}
