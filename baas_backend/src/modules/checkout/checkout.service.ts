import { Injectable, BadRequestException, Logger, ConflictException, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, CheckoutLink, PaymentMethod, CheckoutStatus } from '@/entities';
import { CreatePixPaymentDto, CreateCardPaymentDto } from './dto/create-checkout.dto';
import { LeraBoxService } from '../lera-box/lera-box.service';
import { FeesService } from '../fees/fees.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @InjectRepository(CheckoutLink)
    private readonly checkoutRepository: Repository<CheckoutLink>,
    private readonly leraBoxService: LeraBoxService,
    private readonly feesService: FeesService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Processa Pagamento via Pix
   */
  async processPixPayment(user: User, dto: CreatePixPaymentDto) {
    const token = user.gatewayAccount?.token;
    if (!token) {
      throw new BadRequestException('Conta do gateway não configurada para este lojista.');
    }

    const amountInReais = dto.amount / 100;
    const externalReference = dto.externalReference || `REF_PIX_${Date.now()}_${uuidv4().substring(0, 8)}`;
    const cleanDocument = dto.payerDocument.replace(/\D/g, '');

    const checkoutLink = this.checkoutRepository.create({
      externalReference,
      amount: dto.amount,
      paymentMethod: PaymentMethod.PIX,
      status: CheckoutStatus.PENDING,
      merchant: user,
    });
    await this.checkoutRepository.save(checkoutLink);

    const pixResponse = await this.leraBoxService.createPixPayment(token, {
      amount: dto.amount,
      payerDocument: cleanDocument,
      externalReference,
      ...(dto.description && { description: dto.description }),
    });

    try {
      const publicBaseUrl = 
        this.configService.get<string>('PUBLIC_APP_URL') 
        || this.configService.get<string>('APP_BASE_URL')
      ;

      const normalizedUrl = publicBaseUrl.replace(/\/+$/, '');
      const secret = this.configService.get<string>('WEBHOOK_SECRET') || 'LeraBoxWebhookSecret2026';

      await this.leraBoxService.registerWebhook(token, {
        event: 'PAYMENT_PIX' as any,
        url: `${normalizedUrl}/api/webhooks/receiver`,
        secret,
      });
    } catch (registerError: any) {
      const gatewayMessage =
        typeof registerError?.response?.data === 'string'
          ? registerError.response.data
          : registerError?.response?.data?.message ||
            registerError?.response?.data ||
            registerError?.message ||
            'Erro ao registrar webhook';

      this.logger.warn(
        `Webhook de pagamento PIX não foi registrado: ${JSON.stringify(gatewayMessage)}`,
      );
    }

    if (pixResponse?.id) {
      checkoutLink.gatewayPaymentId = pixResponse.id;
      await this.checkoutRepository.save(checkoutLink);
    }

    return pixResponse;
  }

  /**
   * Processa Pagamento via Cartão de Crédito
   */
  async processCardPayment(user: User, dto: CreateCardPaymentDto) {
    const token = user.gatewayAccount?.token;
    if (!token) {
      throw new BadRequestException('Conta do gateway não configurada para este lojista.');
    }

    const detectedBrand = this.detectCardBrand(dto.cardNumber);

    if (this.feesService) {
      try {
        await this.feesService.validateFeePercent(
          dto.installments,
          dto.feePercent,
          detectedBrand,
        );
      } catch (error: any) {
        throw new BadRequestException(
          error?.message || 'Taxa (feePercent) inválida para a quantidade de parcelas solicitada.',
        );
      }
    }

    const externalReference = dto.externalReference || `REF_CARD_${Date.now()}_${uuidv4().substring(0, 8)}`;

    const checkoutLink = this.checkoutRepository.create({
      externalReference,
      amount: dto.amount,
      paymentMethod: PaymentMethod.CARD,
      installments: dto.installments,
      feePercent: dto.feePercent,
      status: CheckoutStatus.PENDING,
      merchant: user,
    });

    try {
      await this.checkoutRepository.save(checkoutLink);
    } catch (dbError: any) {
      if (dbError?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`A referência externa '${externalReference}' já existe.`);
      }
      throw new InternalServerErrorException('Erro ao registrar a intenção de cobrança.');
    }

    let cardResponse: any;

    try {
      cardResponse = await this.leraBoxService.createCardPayment(token, {
        amount: dto.amount,
        installments: dto.installments,
        feePercent: dto.feePercent,
        externalReference,
        cardNumber: dto.cardNumber,
        cardHolder: dto.cardHolder,
        expiryMonth: dto.expiryMonth,
        expiryYear: dto.expiryYear,
        cvv: dto.cvv,
        ...(dto.description && { description: dto.description }),
      });
    } catch (gatewayError: any) {
      checkoutLink.status = CheckoutStatus.DENIED;
      await this.checkoutRepository.save(checkoutLink);

      throw new BadRequestException(
        gatewayError?.response?.data?.message ||
          gatewayError?.response?.data ||
          'Falha no processamento da transação de cartão.',
      );
    }

    if (cardResponse?.id) {
      checkoutLink.gatewayPaymentId = cardResponse.id;
    }
    if (cardResponse?.status) {
      checkoutLink.status = cardResponse.status as CheckoutStatus;
    }
    if (cardResponse?.metadata?.cardBrand) {
      checkoutLink.brand = cardResponse.metadata.cardBrand;
    }
    await this.checkoutRepository.save(checkoutLink);

    return {
      checkoutId: checkoutLink.id,
      externalReference: checkoutLink.externalReference,
      status: checkoutLink.status,
      amount: checkoutLink.amount,
      gatewayResponse: cardResponse,
    };
  }

  private detectCardBrand(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');

    if (/^4/.test(digits)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD';
    if (/^(4011|431274|438935|451416|457393|4576|4577|5067|5090|627780|636297|6500|6501|6502|6503|6504|6505|6506|6507|6508|6509|6510|6511|6512|6513|6514|6515|6516|6517|6518|6519|6521|6522|6550)/.test(digits)) return 'ELO';

    return 'VISA';
  }

  /**
   * Consulta os dados de um checkout por ID ou externalReference
   */
  async getCheckoutById(id: string) {
    const checkout = await this.checkoutRepository.findOne({
      where: { id },
    });

    if (!checkout) {
      throw new NotFoundException(`Checkout com ID '${id}' não encontrado.`);
    }

    return {
      id: checkout.id,
      externalReference: checkout.externalReference,
      amount: checkout.amount,
      paymentMethod: checkout.paymentMethod,
      installments: checkout.installments,
      feePercent: checkout.feePercent,
      brand: checkout.brand,
      status: checkout.status,
      gatewayPaymentId: checkout.gatewayPaymentId,
      createdAt: checkout.createdAt,
      updatedAt: checkout.updatedAt,
    };
}
}