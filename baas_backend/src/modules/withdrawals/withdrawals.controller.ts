import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@ApiTags('Withdrawals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @ApiOperation({ summary: 'Solicita a realização de um saque via PIX' })
  async create(@Req() req: any, @Body() dto: CreateWithdrawalDto) {
    const userId = req.user.id || req.user.sub;
    return this.withdrawalsService.createWithdrawal(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém o comprovante e status do saque por ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id || req.user.sub;
    return this.withdrawalsService.getWithdrawalById(userId, id);
  }
}