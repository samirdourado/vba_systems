export interface LeraBoxUser {
  id: string;
  personType: 'PF' | 'PJ' | string;
  name: string;
  tradingName: string;
  email: string;
  document: string;
}

export interface RawLeraBoxLoginResponse {
  access_token: string;
  token_type: string;
  codigoCliente: number;
  chaveLoja: string;
  user: LeraBoxUser;
}

export interface LeraBoxAuthResponse {
  token: string;
  clientCode: string;
  storeKey: string;
}

export interface LeraBoxRegisterDto {
  personType: 'PF' | 'PJ';
  name: string;
  tradingName?: string;
  email: string;
  phone: string;
  document: string;
  password?: string;
  zipCode: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface LeraBoxPixPaymentDto {
  amount: number;
  payerDocument: string;
  description?: string;
  externalReference?: string;
}

export interface LeraBoxCardPaymentDto {
  amount: number;
  installments: number;
  feePercent: number;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  description?: string;
  externalReference?: string;
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