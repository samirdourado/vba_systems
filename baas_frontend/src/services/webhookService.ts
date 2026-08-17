import { api } from './api'

export type WebhookEventType = 'PAYMENT_PIX' | 'PAYMENT_CARD'

export type RegisteredWebhook = {
  id: string
  event: WebhookEventType
  url: string
  hasSecret: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export const listWebhooks = async () => {
  const response = await api.get('/api/webhooks')
  return response.data as RegisteredWebhook[]
}

export const deleteWebhook = async (id: string) => {
  const response = await api.delete(`/api/webhooks/${id}`)
  return response.data as { deleted: boolean }
}
