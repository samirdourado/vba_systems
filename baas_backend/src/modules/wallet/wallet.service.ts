import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, CheckoutLink } from '@/entities';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(CheckoutLink)
    private readonly checkoutRepository: Repository<CheckoutLink>,
  ) {}

  /**
   * Cria uma nova carteira com saldo zerado
   */
  async createWallet(userId: string): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      userId,
      balance: 0,
      frozenBalance: 0,
    });
    return await this.walletRepository.save(wallet);
  }

  /**
   * Busca a carteira pelo ID do usuário.
   * Cria automaticamente caso seja um usuário antigo sem wallet.
   */
  async getWalletByUserId(userId: string) {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.createWallet(userId);
    }

    return {
      id: wallet.id,
      balance: Number(wallet.balance || 0),
      frozenBalance: Number(wallet.frozenBalance || 0),
    };
  }

  /**
   * Obtém o extrato de transações do lojista
   */
  async getTransactions(userId: string, query: GetTransactionsQueryDto) {
    const { limit, status, type } = query;

    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.createWallet(userId);
    }

    const balanceNumber = Number(wallet.balance || 0);

    const balanceFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(balanceNumber);

    const queryBuilder = this.checkoutRepository
      .createQueryBuilder('checkout')
      .where('checkout.merchant_id = :userId', { userId })
      .orderBy('checkout.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('checkout.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('checkout.paymentMethod = :type', { type });
    }

    if (limit) {
      queryBuilder.take(Number(limit));
    }

    const checkouts = await queryBuilder.getMany();

    const transactions = checkouts.map((item) => ({
      id: item.id,
      externalReference: item.externalReference,
      amount: Number(item.amount),
      amountFormatted: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Number(item.amount)),
      paymentMethod: (item as any).paymentMethod || type,
      status: item.status,
      createdAt: (item as any).createdAt,
    }));

    return {
      walletId: wallet.id,
      balance: Math.round(balanceNumber * 100),
      balanceFormatted,
      filters: {
        status: status || null,
        type: type || null,
      },
      transactions,
    };
  }
}