import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatCentsToBRL, formatDateBR } from '../../utils/formatters'

interface CheckoutResultProps {
  id: string
  amount: number
  status: string
  paymentMethod?: string
  brand?: string
  installments?: number
  createdAt?: string
}

export function CheckoutResultCard({
  id,
  amount,
  status,
  paymentMethod,
  brand,
  installments,
  createdAt,
}: CheckoutResultProps) {
  const isApproved = status === 'APPROVED'
  const isPending = status === 'PENDING'
  const isDenied = status === 'DENIED' || status === 'CANCELLED' || status === 'EXPIRED'

  return (
    <div className="mx-auto w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
        
        {/* Header de Status */}
        <div className={`p-6 flex flex-col items-center justify-center border-b border-white/5 ${
          isApproved ? 'bg-emerald-500/10' :
          isPending ? 'bg-amber-500/10' :
          'bg-red-500/10'
        }`}>
          {isApproved && (
            <>
              <div className="mb-4 rounded-full bg-emerald-500/20 p-3">
                <CheckCircle2 size={48} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-50">Pagamento Aprovado!</h2>
              <p className="mt-1 text-sm text-emerald-200/80">Sua transação foi concluída com sucesso.</p>
            </>
          )}
          {isPending && (
            <>
              <div className="mb-4 rounded-full bg-amber-500/20 p-3">
                <Clock size={48} className="text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-amber-50">Pagamento Pendente</h2>
              <p className="mt-1 text-sm text-amber-200/80">Aguardando a confirmação do pagamento.</p>
            </>
          )}
          {isDenied && (
            <>
              <div className="mb-4 rounded-full bg-red-500/20 p-3">
                <XCircle size={48} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-50">Pagamento Falhou</h2>
              <p className="mt-1 text-sm text-red-200/80">A transação foi recusada ou cancelada.</p>
            </>
          )}
        </div>

        {/* Detalhes */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <span className="block text-sm text-[#cbd5e1]">Valor do Pedido</span>
            <strong className="mt-1 block text-4xl font-bold text-white tracking-tight">
              {formatCentsToBRL(amount)}
            </strong>
          </div>

          <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#9ca3af]">ID do Pedido</span>
              <span className="font-mono text-[#e2e8f0] truncate ml-4" title={id}>{id.split('-')[0]}...</span>
            </div>

            {paymentMethod && (
              <div className="flex justify-between text-sm">
                <span className="text-[#9ca3af]">Método</span>
                <span className="font-medium text-[#e2e8f0]">
                  {paymentMethod === 'CARD' ? 'Cartão de Crédito' : 
                   paymentMethod === 'PIX' ? 'Pix' : paymentMethod}
                </span>
              </div>
            )}

            {brand && (
              <div className="flex justify-between text-sm">
                <span className="text-[#9ca3af]">Bandeira</span>
                <span className="font-medium text-[#e2e8f0] uppercase">{brand}</span>
              </div>
            )}

            {installments && installments > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#9ca3af]">Parcelas</span>
                <span className="font-medium text-[#e2e8f0]">{installments}x</span>
              </div>
            )}

            {createdAt && (
              <div className="flex justify-between text-sm">
                <span className="text-[#9ca3af]">Data</span>
                <span className="font-medium text-[#e2e8f0]">
                  {formatDateBR(createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
