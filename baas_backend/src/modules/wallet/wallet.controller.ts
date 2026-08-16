import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Obtém o saldo atual e dados da carteira' })
  async getWallet(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.walletService.getWalletByUserId(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Obtém o extrato de transações com filtros opcionais' })
  async getTransactions(
    @Req() req: any,
    @Query() query: GetTransactionsQueryDto,
  ) {
    const userId = req.user.id || req.user.sub;
    return this.walletService.getTransactions(userId, query);
  }
}