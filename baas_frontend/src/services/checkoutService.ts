import { api } from './api'

export const createCheckoutLink = async (data: {
  amount: number
  payerDocument: string
  description?: string
  externalReference?: string
}) => {
  const response = await api.post('/checkout/pix', data)
  return response.data
}

export const getCheckoutLink = async (id: string) => {
  const response = await api.get(`/checkout/${id}`)
  return response.data
}

export const getFees = async (params?: { brand?: string }) => {
  const response = await api.get('/fees', {
    params: params && Object.keys(params).length > 0 ? params : undefined,
  })
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

export const payCard = async (cardData: Record<string, unknown>) => {
  const response = await api.post('/checkout/card', cardData)
  return response.data
}
