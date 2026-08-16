import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { getCheckoutInfo } from '../../services/checkoutService'
import { PixPayment } from '../../components/checkout/PixPayment'
import { CardPayment } from '../../components/checkout/CardPayment'
import { CheckoutResultCard } from '../../components/checkout/CheckoutResultCard'

type CheckoutInfo = {
  id: string
  externalReference: string
  amount: number
  paymentMethod?: string
  installments?: number
  feePercent?: string
  brand?: string
  status: string
  gatewayPaymentId?: string
  createdAt?: string
  updatedAt?: string
}

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD'>('PIX')

  useEffect(() => {
    const loadCheckout = async () => {
      if (!id) {
        // Se não houver ID (ex: renderizado direto no Dashboard), usar um mock para demonstração
        setCheckoutInfo({
          id: 'demo-123',
          externalReference: 'DEMO-CHECKOUT-001',
          amount: 15000, // R$ 150,00
          status: 'PENDING'
        })
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await getCheckoutInfo(id)
        setCheckoutInfo(data)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Link de pagamento não encontrado ou expirado.')
      } finally {
        setLoading(false)
      }
    }

    loadCheckout()
  }, [id])

  const handlePaymentSuccess = async () => {
    // Quando o pagamento der sucesso, podemos recarregar as info do checkout para ver o status atualizado
    if (!id) return
    try {
      const data = await getCheckoutInfo(id)
      setCheckoutInfo(data)
    } catch (e) {
      console.error('Falha ao atualizar o status após pagamento', e)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-[#d1d5db]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#c084fc] border-r-transparent" />
          Carregando pagamento...
        </div>
      </main>
    )
  }

  if (error || !checkoutInfo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(170,59,255,0.1),transparent_40%),linear-gradient(135deg,#000000_0%,#000000_100%)] p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-50">Ops!</h1>
          <p className="mt-2 text-[#9ca3af]">{error || 'Não foi possível carregar as informações deste link.'}</p>
        </div>
      </main>
    )
  }

  const isFinalized = checkoutInfo.status === 'APPROVED' || checkoutInfo.status === 'DENIED' || checkoutInfo.status === 'CANCELLED'
  const isDashboardView = !id // Renderizado no Dashboard

  return (
    <main className={
      isDashboardView
        ? "w-full px-4"
        : "flex min-h-screen justify-center bg-[radial-gradient(circle_at_top_left,rgba(170,59,255,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,189,89,0.18),transparent_28%),linear-gradient(135deg,#000000_0%,#0f172a_50%,#020617_100%)] p-4 pt-12 sm:p-8 sm:pt-20"
    }>

      <div className={`flex w-full flex-col items-center ${isDashboardView ? '' : 'max-w-[1000px]'}`}>
        {/* Header (Logo Seguro) */}
        <header className="mb-8 flex w-full items-center justify-center gap-3">
          <img src="/logo.webp" alt="Logo BAAS" className="h-8 object-contain" />
          <div className="h-6 w-px bg-white/20"></div>
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
            <ShieldCheck size={16} /> Checkout Seguro
          </span>
        </header>

        {/* Corpo: Duas Colunas */}
        <div className="w-full items-start gap-8 lg:grid lg:grid-cols-[1fr_400px]">
          {/* Coluna 1: Como você prefere pagar? */}
          <div className="flex w-full flex-col">
            {!isFinalized ? (
              <div className={`w-full rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8 ${isDashboardView ? '' : 'shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md'}`}>
                <h2 className="mb-6 text-2xl font-bold text-white">Como você prefere pagar?</h2>

                <div className="mb-8 flex rounded-xl bg-black/40 p-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${paymentMethod === 'PIX'
                      ? 'bg-white text-black shadow-md'
                      : 'text-[#9ca3af] hover:text-white'
                      }`}
                  >
                    Pix
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${paymentMethod === 'CARD'
                      ? 'bg-white text-black shadow-md'
                      : 'text-[#9ca3af] hover:text-white'
                      }`}
                  >
                    Cartão de Crédito
                  </button>
                </div>

                <div className="min-h-[300px]">
                  {paymentMethod === 'PIX' ? (
                    <PixPayment
                      amount={checkoutInfo.amount}
                      description={`Pagamento pedido ${checkoutInfo.externalReference}`}
                      externalReference={checkoutInfo.externalReference}
                      onSuccess={handlePaymentSuccess}
                    />
                  ) : (
                    <CardPayment
                      amount={checkoutInfo.amount}
                      description={`Pagamento pedido ${checkoutInfo.externalReference}`}
                      externalReference={checkoutInfo.externalReference}
                      onSuccess={handlePaymentSuccess}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center">
                <CheckoutResultCard
                  id={checkoutInfo.id}
                  amount={checkoutInfo.amount}
                  status={checkoutInfo.status}
                  paymentMethod={checkoutInfo.paymentMethod}
                  brand={checkoutInfo.brand}
                  installments={checkoutInfo.installments}
                  createdAt={checkoutInfo.createdAt}
                />
              </div>
            )}
          </div>

          {/* Coluna 2: Resumo do Pedido */}
          <aside className="mt-8 lg:mt-0 w-full">
            <div className={`sticky top-8 rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8 ${isDashboardView ? '' : 'shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md'}`}>
              <h3 className="mb-6 text-xl font-bold text-white">Resumo do pedido</h3>

              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div className="pr-4">
                    <p className="font-medium text-white">Referência</p>
                    <p className="text-sm text-[#9ca3af]">{checkoutInfo.externalReference}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[#9ca3af]">Subtotal</span>
                  <span className="font-medium text-white">
                    {(checkoutInfo.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-medium text-white">Total a pagar</span>
                  <span className="text-2xl font-bold text-[#c084fc]">
                    {(checkoutInfo.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-[#6b7280]">
                <ShieldCheck size={24} className="text-[#a855f7]/50" />
                <p>Pagamento 100% seguro processado por <br /> <strong className="text-[#9ca3af]">VBA Systems & Lera Box</strong></p>
              </div>
            </div>
          </aside>
        </div>
      </div>

    </main>
  )
}
