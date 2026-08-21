import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, LoaderCircle } from 'lucide-react'
import { useContext, useState } from 'react'
import { PaymentsContext } from '../../context/PaymentsContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pixPaymentDataSchema, type PixPaymentFormData, type PixPaymentResult } from '../../schemas/paymentsSchema'
import { getErrorMessage } from '../../utils/getErrorMessage'
import axios from 'axios'
import { formatDocument, sanitizeDocument } from '../../utils/documentsFormatter'
import { formatAmount, parseAmountToCents } from '../../utils/currencyFormatter'
import { ShieldCheck } from 'lucide-react'
import { parseDate } from '../../utils/dateFormatter'

export function PixPayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pixData, setPixData] = useState<PixPaymentResult | null>(null);
  // const [pixData, setPixData] = useState<{ qrCodeBase64: string; copyPaste: string } | null>(null)
  const [copied, setCopied] = useState(false);  
 
  const { 
    handleSubmit,
    register
   } = useForm<PixPaymentFormData>({
    resolver: zodResolver(pixPaymentDataSchema)
  });
  
  const { pixPaymentMethod } = useContext(PaymentsContext);

  const onFormSubmit = async (formData: PixPaymentFormData) => {
    try {
      setLoading(true);

      const payload = {
        ...formData,
        payerDocument: sanitizeDocument(formData.payerDocument),
        amount: parseAmountToCents(formData.amount)
      };

      const response = await pixPaymentMethod(payload);
      setPixData(response);

    } catch (error) {
      console.error('4 - erro:', error);
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = getErrorMessage(statusCode);

        setError(message)
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  if (pixData) {
    return (
      
      <section className="mt-8 flex w-full flex-col gap-8 lg:mt-0 lg:flex-row lg:items-start">
        <div className="w-full min-w-0 flex-1 rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8 lg:sticky lg:top-8">
          <h3 className="mb-6 text-xl font-bold text-white">Dados do pagamento</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="pr-4">
                <p className="font-medium text-white">Referência:</p>
                <p className="text-sm text-[#9ca3af]">{pixData.externalReference}</p>
              </div>
              <div className="pr-4">
                <p className="font-medium text-white">Data:</p>
                <p className="text-sm text-[#9ca3af]">{parseDate(pixData.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="pr-4">
                <p className="font-medium text-white">Descrição:</p>
                <p className="text-sm text-[#9ca3af]">{pixData.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-medium text-white">Total a pagar</span>
              <span className="text-2xl font-bold text-[#c084fc]">
                {(pixData.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-[#6b7280]">
            <ShieldCheck size={24} className="text-[#a855f7]/50" />
            <p>Pagamento 100% seguro processado por <br /> <strong className="text-[#9ca3af]">VBA Systems & Lera Box</strong></p>
          </div>
        </div>

        <aside className="flex w-full min-w-0 flex-1 flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300 lg:max-w-lg">
        <h4 className="text-xl font-bold text-white">Escaneie o QR Code</h4>
        <div className="rounded-2xl bg-white p-4 shadow-[0_0_20px_rgba(170,59,255,0.4)]">
          {pixData.qrCodeBase64 && pixData.qrCodeBase64.startsWith('data:image') ? (
            <img src={pixData.qrCodeBase64} alt="QR Code Pix" className="h-48 w-48 object-contain" />
          ) : (
            <QRCodeSVG value={pixData.copyPaste} size={192} />
          )}
        </div>        
        <div className="w-full">
          <p className="mb-2 text-center text-sm font-medium text-[#d1d5db]">Ou copie o código abaixo</p>
          <div className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2">
            <input 
              type="text" 
              readOnly 
              value={pixData.copyPaste} 
              className="flex-1 bg-transparent px-2 text-sm text-white focus:outline-none" 
            />
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Copiar código Pix"
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>
          </div>
        </div>
        <button
          type="button"
          // onClick={() => onSuccess(pixData)}
          className="mt-6 w-full rounded-xl border border-[#34d399]/40 bg-[#34d399]/10 px-4 py-3 font-semibold text-[#34d399] transition hover:bg-[#34d399]/20"
        >
          Já realizei o pagamento
        </button>
      </aside>        
      </section>
      
    )
  }
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <fieldset>
        <label className="mb-2 block text-sm font-medium text-[#d1d5db]">CPF / CNPJ</label>
        <input          
          type="text"
          id='payerDocument'          
          placeholder="Digite seu documento"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
          {...register("payerDocument", {
            onChange: (e) => {
              e.target.value = formatDocument(e.target.value)
            },})
          }
        />
      </fieldset>
      <fieldset>
        <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Referencia:</label>
        <input
          type="text"
          id='externalReference'
          placeholder="Informe uma descrição"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
          {...register("externalReference")}
        />
      </fieldset>
      <fieldset>
        <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Descrição:</label>
        <input
          type="text"
          id='description'
          placeholder="Informe uma descrição"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
          {...register("description")}
        />
      </fieldset>
      <fieldset>
        <label className="mb-2 block text-sm font-medium text-[#d1d5db]">Valor:</label>
        <input
          type="text"
          inputMode='numeric'
          id='amount'
          placeholder="Informe o valor"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
          {...register("amount", {
            onChange: (e) => {
              e.target.value = formatAmount(e.target.value)
            },})}
        />
      </fieldset>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#10b981] to-[#059669] px-4 py-3 text-base font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {loading ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Gerando...
          </>
        ) : (
          'Gerar Pix'
        )}
      </button>
    </form>
  )
}
