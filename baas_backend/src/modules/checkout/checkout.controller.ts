import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CreatePixPaymentDto, CreateCardPaymentDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Checkout & Pagamentos')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('pix')
  @ApiOperation({ summary: 'Gera uma cobrança via Pix' })
  async createPix(@Request() req, @Body() dto: CreatePixPaymentDto) {
    return this.checkoutService.processPixPayment(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('card')
  @ApiOperation({ summary: 'Gera uma cobrança via Cartão de Crédito com verificação de taxa' })
  async createCard(@Request() req, @Body() dto: CreateCardPaymentDto) {
    return this.checkoutService.processCardPayment(req.user, dto);
  }

  @Get(':externalReference')
  @ApiOperation({ summary: 'Consulta o status de um checkout por referência externa' })
  async getCheckout(@Param('externalReference') externalReference: string) {
    return this.checkoutService.getCheckoutByRef(externalReference);
  }
}