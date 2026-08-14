export interface RawLeraBoxLoginResponse {
  token: string;
  CodigoCliente: string;
  ChaveLoja: string;
}

export interface LeraBoxAuthResponse {
  token: string;
  clientCode: string;
  storeKey: string;
}

export interface LeraBoxRegisterDto {
  name: string;
  email: string;
  document: string;
  phone: string;
  password?: string;
}

export interface LeraBoxPixPaymentDto {
  amount: number;
  externalReference: string;
}

export interface LeraBoxCardPaymentDto {
  amount: number;
  installments: number;
  feePercent: number;
  externalReference: string;
  cardNumber?: string;
  cardHolderName?: string;
  cardExpirationDate?: string;
  cardCvv?: string;
}

export interface LeraBoxWithdrawalDto {
  amount: number;
  pixKey: string;
}

export interface TransactionFilterParams {
  status?: string;
  type?: string;
  limit?: number;
}