import { createContext, useContext, type ReactNode } from 'react'
import { api } from '../services/api'
import type { PixPaymentPayload, PixPaymentResult } from '../schemas/paymentsSchema'

export interface PaymentsContextData {
  pixPaymentMethod: (data: PixPaymentPayload) => Promise<PixPaymentResult>
}

export const PaymentsContext = createContext<PaymentsContextData>({} as PaymentsContextData);

export const PaymentsProvider = ({ children }: { children: ReactNode }) => {

    const pixPaymentMethod = async (payload: PixPaymentPayload) => {
        const { amount, ...data } = payload;
        const response = await api.post('/checkout/pix', {amount: Number(amount), ...data});
        /*
            Se tiver response.data Chamar o webHook.
            O prório contexto vai identificar o tipo de transação
            a partir da chave type com a opção PIX PAYMENT_PIX, PAYMENT_CARD, ou WITHDRAWAL
            */
        return response.data;
    }

    return (
        <PaymentsContext.Provider
            value={{
                pixPaymentMethod
            }}
        >
            { children }
        </PaymentsContext.Provider>
    )
}

export const useAuth = () => useContext(PaymentsContext);