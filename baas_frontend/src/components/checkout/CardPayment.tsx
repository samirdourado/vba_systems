import { LoaderCircle, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { payCard, getFees } from '../../services/checkoutService'

interface CardPaymentProps {
  amount: number
  description: string
  externalReference: string
  onSuccess: (data: any) => void
}

type FeeOption = {
  id?: string
  brand?: string
  installments: number
  feePercent: number
  feePercentFormatted?: string
}

const brandOptions = [
  { value: '', label: 'Todas' },
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'Master Card' },
  { value: 'ELO', label: 'Elo' },
]

const formatBrandLabel = (brand?: string) => {
  switch (brand?.toUpperCase()) {
    case 'VISA':
      return 'Visa'
    case 'MASTERCARD':
      return 'Master Card'
    case 'ELO':
      return 'Elo'
    default:
      return 'Todas'
  }
}

const detectCardBrand = (cardNumber: string) => {
  const digits = cardNumber.replace(/\D/g, '')

  if (/^4/.test(digits)) return 'VISA'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD'
  if (/^(4011|431274|438935|451416|457393|4576|4577|5067|5090|627780|636297|6500|6501|6502|6503|6504|6505|6506|6507|6508|6509|6510|6511|6512|6513|6514|6515|6516|6517|6518|6519|6521|6522|6550)/.test(digits)) return 'ELO'

  return 'VISA'
}

export function CardPayment({ amount, description, externalReference, onSuccess }: CardPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fees, setFees] = useState<FeeOption[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedInstallment, setSelectedInstallment] = useState(1)
  const [selectedFeeKey, setSelectedFeeKey] = useState<string>('')

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  })

  useEffect(() => {
    const baseBrand = selectedBrand || detectCardBrand(cardData.cardNumber)
    const fetchFees = async () => {
      try {
        const response = await getFees(baseBrand ? { brand: baseBrand } : undefined)
        const feeList = Array.isArray(response) ? response : response?.fees ?? []
        setFees(feeList)

        const firstFee = feeList[0]
        const defaultKey = firstFee ? `${firstFee.brand ?? 'ALL'}-${firstFee.installments}` : ''

        setSelectedFeeKey((currentKey) => {
          if (!currentKey || !feeList.some((fee: FeeOption) => `${fee.brand ?? 'ALL'}-${fee.installments}` === currentKey)) {
            return defaultKey
          }
          return currentKey
        })

        const currentFee = feeList.find((fee: FeeOption) => `${fee.brand ?? 'ALL'}-${fee.installments}` === selectedFeeKey)
        if (currentFee) {
          setSelectedInstallment(currentFee.installments)
        } else if (firstFee) {
          setSelectedInstallment(firstFee.installments)
        }
      } catch (err) {
        console.error('Failed to load fees', err)
      }
    }

    if (cardData.cardNumber.length >= 4 || selectedBrand) {
      fetchFees()
    }
  }, [selectedBrand, cardData.cardNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const resolvedBrand = (selectedBrand || detectCardBrand(cardData.cardNumber)) as 'VISA' | 'MASTERCARD' | 'ELO'
    const matchingFee = fees.find((fee) => {
      const isSameOption = `${fee.brand ?? 'ALL'}-${fee.installments}` === selectedFeeKey
      const isSameBrand = !selectedBrand || fee.brand?.toUpperCase() === resolvedBrand.toUpperCase()
      return isSameOption || (isSameBrand && fee.installments === selectedInstallment)
    })
    const feePercent = matchingFee?.feePercent ?? 0

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
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Bandeira</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            >
              {brandOptions.map((brand) => (
                <option key={brand.value || 'all'} value={brand.value}>
                  {brand.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Parcelas</label>
            <select
              value={selectedFeeKey}
              onChange={(e) => {
                const nextKey = e.target.value
                const nextFee = fees.find((fee) => `${fee.brand ?? 'ALL'}-${fee.installments}` === nextKey)
                setSelectedFeeKey(nextKey)
                if (nextFee) {
                  setSelectedInstallment(nextFee.installments)
                }
              }}
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
            >
              {fees.map((fee) => {
                const baseValue = amount / 100
                const tx = fee.feePercent / 100
                const installmentValue = (baseValue * (1 + tx)) / fee.installments
                const brandLabel = formatBrandLabel(fee.brand)
                const feeLabel = fee.feePercentFormatted || `${fee.feePercent}%`

                return (
                  <option key={`${fee.brand}-${fee.installments}`} value={`${fee.brand ?? 'ALL'}-${fee.installments}`}>
                    {fee.installments}x de {installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    {fee.installments === 1 ? ' à vista' : ` (${feeLabel} de taxa)`}
                    {selectedBrand === '' ? ` • ${brandLabel}` : ''}
                  </option>
                )
              })}
            </select>
          </div>
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
