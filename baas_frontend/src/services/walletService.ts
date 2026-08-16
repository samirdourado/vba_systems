import { api } from './api'

export type WalletFilters = {
  limit?: number
  status?: string
  type?: string
}

export const getWallet = async () => {
  const response = await api.get('/wallet')
  return response.data
}

export const getTransactions = async (filters: WalletFilters = {}) => {
  const response = await api.get('/wallet/transactions', { params: filters })
  return response.data
}

export const requestWithdrawal = async (data: {
  amount: number
  pixKey: string
  description?: string
  externalReference?: string
  document?: string
}) => {
  const response = await api.post('/withdrawals', data)
  return response.data
}

export const getWithdrawalStatus = async (id: string) => {
  const response = await api.get(`/withdrawals/${id}`)
  return response.data
}
