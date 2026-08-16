import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { payPix } from '../../services/checkoutService'

interface PixPaymentProps {
  amount: number
  description: string
  externalReference: string
  onSuccess: (data: any) => void
}

export function PixPayment({ amount, description, externalReference, onSuccess }: PixPaymentProps) {
  const [payerDocument, setPayerDocument] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pixData, setPixData] = useState<{ qrCodeBase64: string; copyPaste: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await payPix({
        amount,
        payerDocument,
        description,
        externalReference
      })
      setPixData(result)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao gerar o Pix.')
    } finally {
      setLoading(false)
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
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300">
        <h4 className="text-xl font-bold text-white">Escaneie o QR Code</h4>
        <div className="rounded-2xl bg-white p-4 shadow-[0_0_20px_rgba(170,59,255,0.4)]">
          {/* O retorno especifica qrCodeBase64 como data URI ou podemos usar o proprio copyPaste para gerar localmente se não vier correto */}
          {pixData.qrCodeBase64 && pixData.qrCodeBase64.startsWith('data:image') ? (
            <img src={pixData.qrCodeBase64} alt="QR Code Pix" className="h-48 w-48 object-contain" />
          ) : (
            <QRCodeSVG value={pixData.copyPaste} size={192} />
          )}
        </div>
        
        <div className="w-full">
          <p className="mb-2 text-center text-sm font-medium text-[#d1d5db]">Ou copie o código abaixo</p>
          <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2">
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
          onClick={() => onSuccess(pixData)}
          className="mt-6 w-full rounded-xl border border-[#34d399]/40 bg-[#34d399]/10 px-4 py-3 font-semibold text-[#34d399] transition hover:bg-[#34d399]/20"
        >
          Já realizei o pagamento
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleGeneratePix} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#d1d5db]">CPF / CNPJ</label>
        <input
          type="text"
          value={payerDocument}
          onChange={(e) => setPayerDocument(e.target.value)}
          placeholder="Digite seu documento"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-[#a855f7] focus:outline-none"
          required
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !payerDocument}
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
