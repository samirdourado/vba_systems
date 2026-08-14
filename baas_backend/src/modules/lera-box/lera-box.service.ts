import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  LeraBoxRegisterDto,
  LeraBoxAuthResponse,
  RawLeraBoxLoginResponse,
  LeraBoxPixPaymentDto,
  LeraBoxCardPaymentDto,
  LeraBoxWithdrawalDto,
  TransactionFilterParams,
} from './dto/lera-box.dto';

@Injectable()
export class LeraBoxService {
  private readonly logger = new Logger(LeraBoxService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'GATEWAY_BASE_URL',
      'https://api.branchpay.com.br/api',
    );
  }

  private getAuthHeaders(token: string) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async registerUser(data: LeraBoxRegisterDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/users`, data),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error registering user in Lera Box:', error?.response?.data || error.message);
      throw new HttpException(
        error?.response?.data?.message || 'Failed to register on Gateway',
        error?.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async login(email: string, password: string): Promise<LeraBoxAuthResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<RawLeraBoxLoginResponse>(`${this.baseUrl}/auth/login`, {
          email,
          password,
        }),
      );

      const rawData = response.data;
      
      return {
        token: rawData.token,
        clientCode: rawData.CodigoCliente,
        storeKey: rawData.ChaveLoja,
      };
    } catch (error: any) {
      this.logger.error('Error logging in Lera Box:', error?.response?.data || error.message);
      throw new HttpException(
        error?.response?.data?.message || 'Gateway authentication failed',
        error?.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getFees(brand?: string) {
    try {
      const url = brand ? `${this.baseUrl}/fees?brand=${brand}` : `${this.baseUrl}/fees`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching fees:', error?.response?.data || error.message);
      throw new HttpException('Failed to fetch fees from Gateway', HttpStatus.BAD_REQUEST);
    }
  }

  async createPixPayment(token: string, payload: LeraBoxPixPaymentDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/payments/pix`, payload, this.getAuthHeaders(token)),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error creating Pix payment:', error?.response?.data || error.message);
      throw new HttpException(
        error?.response?.data?.message || 'Failed to create Pix payment',
        error?.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createCardPayment(token: string, payload: LeraBoxCardPaymentDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/payments/card`, payload, this.getAuthHeaders(token)),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error creating Card payment:', error?.response?.data || error.message);
      throw new HttpException(
        error?.response?.data?.message || 'Failed to create Card payment',
        error?.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getWalletBalance(token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/wallet`, this.getAuthHeaders(token)),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching wallet balance:', error?.response?.data || error.message);
      throw new HttpException('Failed to fetch wallet balance', HttpStatus.BAD_REQUEST);
    }
  }

  async getTransactions(token: string, params?: TransactionFilterParams) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/wallet/transactions`, {
          ...this.getAuthHeaders(token),
          params,
        }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching transactions:', error?.response?.data || error.message);
      throw new HttpException('Failed to fetch transactions', HttpStatus.BAD_REQUEST);
    }
  }

  async requestWithdrawal(token: string, payload: LeraBoxWithdrawalDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/withdrawals`, payload, this.getAuthHeaders(token)),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error requesting withdrawal:', error?.response?.data || error.message);
      throw new HttpException(
        error?.response?.data?.message || 'Failed to request withdrawal',
        error?.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}