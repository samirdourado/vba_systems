import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckoutLink, CheckoutStatus, Wallet, WebhookEvent } from '@/entities';
import { ReceiveWebhookPayloadDto } from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(CheckoutLink)
    private readonly checkoutRepository: Repository<CheckoutLink>,
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  /**
   * Processa e grava as notificações de webhooks recebidos da LeraBox
   * com verificação de idempotência e busca flexível (OR).
   */
  async handleIncomingWebhook(dto: ReceiveWebhookPayloadDto) {
    const eventId = dto.id || dto.transactionId || dto.txid;

    if (!eventId) {
      throw new BadRequestException('ID do evento não informado no payload.');
    }

    let webhookLog = await this.webhookEventRepository.findOne({
      where: { eventId },
    });

    if (webhookLog?.processed) {
      return { received: true, status: 'already_processed' };
    }

    if (!webhookLog) {
      webhookLog = this.webhookEventRepository.create({
        eventId,
        eventType: dto.event,
        payload: dto,
        processed: false,
      });
      await this.webhookEventRepository.save(webhookLog);
    }

    const paymentId = dto.id || dto.data?.id;
    const externalRef = dto.externalReference || dto.data?.externalReference;

    const whereConditions = [];
    if (paymentId) whereConditions.push({ gatewayPaymentId: paymentId });
    if (externalRef) whereConditions.push({ externalReference: externalRef });

    if (whereConditions.length === 0) {
      webhookLog.errorMessage = 'Identificadores (ID ou externalReference) ausentes no payload.';
      await this.webhookEventRepository.save(webhookLog);
      return { received: true, status: 'missing_identifiers' };
    }

    const checkout = await this.checkoutRepository.findOne({
      where: whereConditions,
    });

    if (!checkout) {
      webhookLog.errorMessage = `Checkout não encontrado para gatewayPaymentId: "${paymentId}" ou externalReference: "${externalRef}".`;
      await this.webhookEventRepository.save(webhookLog);
      return { received: true, status: 'checkout_not_found' };
    }

    try {
      const rawStatus = (dto.status || dto.data?.status || '').toUpperCase();

      switch (rawStatus) {
        case 'APPROVED':
        case 'PAID':
          if (checkout.status !== CheckoutStatus.APPROVED) {
            checkout.status = CheckoutStatus.APPROVED;

            const merchantId = (checkout as any).merchantId || (checkout as any).userId;

            if (merchantId) {
              const wallet = await this.walletRepository.findOne({
                where: { userId: merchantId },
              });

              if (wallet) {
                const currentBalance = Number(wallet.balance || 0);
                const amountToCredit = Number(checkout.amount || dto.amount || dto.data?.amount || 0);

                wallet.balance = currentBalance + amountToCredit;
                await this.walletRepository.save(wallet);
              }
            }
          }
          break;
        case 'DENIED':
        case 'FAILED':
        case 'REFUNDED':
          checkout.status = CheckoutStatus.DENIED;
          break;
        case 'EXPIRED':
          checkout.status = CheckoutStatus.EXPIRED;
          break;
        case 'CANCELLED':
        case 'CANCELED':
          checkout.status = CheckoutStatus.CANCELLED;
          break;
        default:
          break;
      }

      await this.checkoutRepository.save(checkout);

      webhookLog.processed = true;
      webhookLog.errorMessage = undefined;
      await this.webhookEventRepository.save(webhookLog);

      return {
        received: true,
        status: 'success',
        checkoutId: checkout.id,
      };
    } catch (error: any) {
      webhookLog.errorMessage = error?.message || 'Erro ao processar atualização de status.';
      await this.webhookEventRepository.save(webhookLog);
      throw new BadRequestException('Falha no processamento do webhook.');
    }
  }
}