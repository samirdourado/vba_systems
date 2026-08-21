import { z } from 'zod';

export const pixPaymentDataSchema = z.object({
  amount: z.string(),
  description: z.string(),
  payerDocument: z.string().min(11).max(14).nonempty(),
  externalReference: z.string()
});

export const pixPaymentPayloadSchema = z.object({
  amount: z.number(),
  description: z.string(),
  payerDocument: z.string().min(11).max(14).nonempty(),
  externalReference: z.string()
});


export type PixPaymentFormData = z.infer<typeof pixPaymentDataSchema>;
export type PixPaymentPayload = z.infer<typeof pixPaymentPayloadSchema>;


export type PixPaymentResult = {
  id: string;
  type: 'PIX';
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  denialReason?: string;
  amount: number;
  amountFormatted: string;
  description: string;
  message: string;
  metadata: {
    method: string;
    CodigoCliente: number;
    ChaveLoja: string;
    payerDocument: string;
    externalReference: string;
    txid: string;
    emv: string;
    qrCodeBase64: string;
  };
  createdAt: string;
  externalReference: string;
  CodigoCliente: number;
  ChaveLoja: string;
  walletBalance: number;
  walletBalanceFormatted: string;
  txid: string;
  emv: string;
  qrCodeBase64: string;
  copyPaste: string;
};
