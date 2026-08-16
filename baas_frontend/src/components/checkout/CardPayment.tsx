import { LoaderCircle, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { payCard, getFees } from '../../services/checkoutService'

interface CardPaymentProps {
  amount: number
  description: string
  externalReference: string
  onSuccess: (data: any) => void
}

export function CardPayment({ amount, description, externalReference, onSuccess }: CardPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fees, setFees] = useState<{ installments: number; feePercent: number }[]>([])
  const [selectedInstallment, setSelectedInstallment] = useState(1)

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  })

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await getFees()
        const feeList = Array.isArray(response) ? response : response?.fees ?? []
        setFees(feeList)
      } catch (err) {
        console.error('Failed to load fees', err)
      }
    }
    fetchFees()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const feePercent = fees.find((f) => f.installments === selectedInstallment)?.feePercent || 0

    try {
      const result = await payCard({
        amount,
        installments: selectedInstallment,
        feePercent,
        cardNumber: cardData.cardNumber.replace(/\D/g, ''),
        cardHolder: cardData.cardHolder.toUpperCase(),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        cvv: cardData.cvv,
        description,
        externalReference
      })
      onSuccess(result)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao processar pagamento.')
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'cardNumber') {
      setCardData((prev) => ({ ...prev, [name]: formatCardNumber(value) }))
    } else {
      setCardData((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in zoom-in duration-300">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Número do Cartão</label>
        <div className="relative">
          <input
            type="text"
            name="cardNumber"
            value={cardData.cardNumber}
            onChange={handleChange}
            placeholder="0000 0000 0000 0000"
            className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white focus:border-[#a855f7] focus:outline-none"
            required
          />
          <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-[#9ca3af]" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Nome impresso no Cartão</label>
        <input
          type="text"
          name="cardHolder"
          value={cardData.cardHolder}
          onChange={handleChange}
          placeholder="NOME SOBRENOME"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none uppercase"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Validade</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="expiryMonth"
              maxLength={2}
              value={cardData.expiryMonth}
              onChange={handleChange}
              placeholder="MM"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none text-center"
              required
            />
            <span className="self-center text-white/50">/</span>
            <input
              type="text"
              name="expiryYear"
              maxLength={4}
              value={cardData.expiryYear}
              onChange={handleChange}
              placeholder="AAAA"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none text-center"
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#d1d5db]">CVV</label>
          <input
            type="text"
            name="cvv"
            maxLength={4}
            value={cardData.cvv}
            onChange={handleChange}
            placeholder="123"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none text-center"
            required
          />
        </div>
      </div>

      {fees.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Parcelas</label>
          <select
            value={selectedInstallment}
            onChange={(e) => setSelectedInstallment(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
          >
            {fees.map((fee) => {
              // Calcular valor aproximado
              const baseValue = amount / 100
              const tx = fee.feePercent / 100
              // Considerando um cálculo simples apenas para display (a API fará o real)
              const installmentValue = (baseValue * (1 + tx)) / fee.installments
              return (
                <option key={fee.installments} value={fee.installments}>
                  {fee.installments}x de {installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                  {fee.installments === 1 ? ' à vista' : ` (${fee.feePercent}% taxa)`}
                </option>
              )
            })}
          </select>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#aa3bff] to-[#8b5cf6] px-4 py-3 text-base font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {loading ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Processando...
          </>
        ) : (
          'Pagar agora'
        )}
      </button>
    </form>
  )
}
