import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { deleteWebhook, listWebhooks, type RegisteredWebhook } from '../../services/webhookService'

const formatDate = (value?: string) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function WebhookPanel() {
  const [webhooks, setWebhooks] = useState<RegisteredWebhook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadWebhooks = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await listWebhooks()
      setWebhooks(data)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Não foi possível carregar os webhooks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWebhooks()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      setError('')
      setSuccess('')
      await deleteWebhook(id)
      setWebhooks((current) => current.filter((webhook) => webhook.id !== id))
      setSuccess('Webhook removido com sucesso.')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao remover webhook.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c084fc]">Integração</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Webhooks cadastrados</h3>
          </div>
        </div>

        <p className="mt-3 text-sm text-[#9ca3af]">
          Os webhooks são registrados automaticamente ao criar um pagamento via Pix ou cartão no checkout.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            {success}
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        {loading ? (
          <div className="text-sm text-[#9ca3af]">Carregando webhooks...</div>
        ) : webhooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-black/10 px-4 py-5 text-sm text-[#9ca3af]">
            Nenhum webhook cadastrado.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {webhooks.map((webhook) => (
              <article key={webhook.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:-translate-y-1 hover:border-[#a855f7]/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c084fc]">Evento</p>
                    <h4 className="mt-2 text-lg font-bold text-white">{webhook.event}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(webhook.id)}
                    aria-label={`Remover webhook ${webhook.event}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 text-red-100 transition hover:bg-red-500/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <dl className="mt-4 space-y-3 text-sm text-[#d1d5db]">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">URL</dt>
                    <dd className="mt-1 break-all text-xs text-[#e5e7eb]">{webhook.url}</dd>
                  </div>

                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${webhook.active ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-200'}`}>
                        {webhook.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">Criado em</dt>
                    <dd className="mt-1 text-xs text-[#e5e7eb]">{formatDate(webhook.createdAt)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
