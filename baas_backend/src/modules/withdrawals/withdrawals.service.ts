import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal, WithdrawalStatus, Wallet } from '@/entities';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Injectable()
export class WithdrawalsService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async createWithdrawal(userId: string, dto: CreateWithdrawalDto) {
    let wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) {
      wallet = this.walletRepository.create({ userId, balance: 0, frozenBalance: 0 });
      await this.walletRepository.save(wallet);
    }

    const currentBalanceReais = Number(wallet.balance || 0);
    const requestedAmountReais = dto.amount / 100;

    let status = WithdrawalStatus.APPROVED;
    let denialReason: string | null = null;
    let message = 'Transação realizada com sucesso';
    
    if (currentBalanceReais < requestedAmountReais) {
      status = WithdrawalStatus.DENIED;
      denialReason = 'INSUFFICIENT_BALANCE';
      message = 'Saldo insuficiente para realizar a transação';
    } else {
      wallet.balance = currentBalanceReais - requestedAmountReais;
      await this.walletRepository.save(wallet);
    }

    const withdrawal = this.withdrawalRepository.create({
      userId,
      amount: dto.amount,
      pixKey: dto.pixKey,
      description: dto.description,
      externalReference: dto.externalReference,
      document: dto.document,
      status,
      denialReason,
    });

    await this.withdrawalRepository.save(withdrawal);

    const updatedBalanceReais = Number(wallet.balance || 0);
    const updatedBalanceCents = Math.round(updatedBalanceReais * 100);

    const amountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(requestedAmountReais);

    const walletBalanceFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(updatedBalanceReais);

    return {
      id: withdrawal.id,
      type: 'WITHDRAWAL',
      status: withdrawal.status,
      denialReason: withdrawal.denialReason,
      amount: withdrawal.amount,
      amountFormatted,
      description: withdrawal.description || null,
      message,
      metadata: {
        pixKey: withdrawal.pixKey,
        document: withdrawal.document || null,
        externalReference: withdrawal.externalReference || null,
        CodigoCliente: 840021,
        ChaveLoja: 'b83dfa78b3c1080ab7392a352604006e',
      },
      createdAt: withdrawal.createdAt,
      externalReference: withdrawal.externalReference || null,
      CodigoCliente: 840021,
      ChaveLoja: 'b83dfa78b3c1080ab7392a352604006e',
      walletBalance: updatedBalanceCents,
      walletBalanceFormatted,
    };
  }

  async getWithdrawalById(userId: string, id: string) {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id, userId },
    });

    if (!withdrawal) {
      throw new NotFoundException('Solicitação de saque não encontrada.');
    }

    const amountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(withdrawal.amount / 100);

    return {
      id: withdrawal.id,
      type: 'WITHDRAWAL',
      status: withdrawal.status,
      denialReason: withdrawal.denialReason,
      amount: withdrawal.amount,
      amountFormatted,
      description: withdrawal.description || null,
      message:
        withdrawal.status === WithdrawalStatus.APPROVED
          ? 'Transação realizada com sucesso'
          : 'Transação não autorizada',
      metadata: {
        pixKey: withdrawal.pixKey,
        document: withdrawal.document || null,
        ChaveLoja: 'b83dfa78b3c1080ab7392a352604006e',
        CodigoCliente: 840021,
        externalReference: withdrawal.externalReference || null,
      },
      createdAt: withdrawal.createdAt,
    };
  }
}