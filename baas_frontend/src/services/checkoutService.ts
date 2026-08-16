import { api } from './api'

export const createCheckoutLink = async (data: {
  amount: number
  payerDocument: string
  description?: string
  externalReference?: string
}) => {
  // O painel do lojista ainda precisa desse comportamento adaptado.
  // Vou manter para não quebrar o painel.
  const response = await api.post('/checkout/pix', data)
  return response.data
}

// Novos métodos seguindo exatamente a documentação pedida:
export const getCheckoutInfo = async (id: string) => {
  const response = await api.get(`/checkout/${id}`)
  return response.data
}

export const payPix = async (data: {
  amount: number
  payerDocument: string
  description?: string
  externalReference?: string
}) => {
  const response = await api.post('/checkout/pix', data)
  return response.data
}

export const payCard = async (data: {
  amount: number
  installments: number
  feePercent: number
  cardNumber: string
  cardHolder: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  description?: string
  externalReference?: string
}) => {
  const response = await api.post('/checkout/card', data)
  return response.data
}

export const getFees = async (params?: { brand?: string }) => {
  const response = await api.get('/fees', {
    params: params && Object.keys(params).length > 0 ? params : undefined,
  })
  return response.data
}
