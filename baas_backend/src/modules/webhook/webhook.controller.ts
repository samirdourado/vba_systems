import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WebhookService } from './webhook.service';
import { LeraBoxService } from '../lera-box/lera-box.service';
import { CreateLeraBoxWebhookDto, ReceiveWebhookPayloadDto } from './dto/webhook.dto';

@ApiTags('Webhooks')
@Controller('api/webhooks')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly leraBoxService: LeraBoxService,
  ) {}

  @Post('receiver')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Endpoint receptor de notificações do gateway' })
  async handleIncomingWebhook(@Body() dto: ReceiveWebhookPayloadDto) {
    return this.webhookService.handleIncomingWebhook(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Cadastrar / Atualizar webhook no gateway' })
  async registerWebhook(@Request() req, @Body() dto: CreateLeraBoxWebhookDto) {
    const token = req.user?.gatewayAccount?.token || req.user?.gatewayToken;
    return this.leraBoxService.registerWebhook(token, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Listar webhooks cadastrados no gateway' })
  async listWebhooks(@Request() req) {
    const token = req.user?.gatewayAccount?.token || req.user?.gatewayToken;
    return this.leraBoxService.listWebhooks(token);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Remover webhook do gateway' })
  async deleteWebhook(@Request() req, @Param('id') webhookId: string) {
    const token = req.user?.gatewayAccount?.token || req.user?.gatewayToken;
    return this.leraBoxService.deleteWebhook(token, webhookId);
  }
}