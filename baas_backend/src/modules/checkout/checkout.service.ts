import { Injectable, BadRequestException, Logger, ConflictException, InternalServerErrorException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      amountInCents: dto.amount,
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

    if (pixResponse?.id) {
      checkoutLink.gatewayPaymentId = pixResponse.id;
      await this.checkoutRepository.save(checkoutLink);
    }

    return {
      checkoutId: checkoutLink.id,
      externalReference: checkoutLink.externalReference,
      amountInCents: checkoutLink.amountInCents,
      amountInReais,
      status: checkoutLink.status,
      qrCodeBase64: pixResponse?.qrCodeBase64,
      copyPaste: pixResponse?.copyPaste || pixResponse?.emv,
      emv: pixResponse?.copyPaste || pixResponse?.emv,
      txid: pixResponse?.txid || pixResponse?.id,
    };
  }

  /**
   * Processa Pagamento via Cartão de Crédito
   */
  async processCardPayment(user: User, dto: CreateCardPaymentDto) {
    const token = user.gatewayAccount?.token;
    if (!token) {
      throw new BadRequestException('Conta do gateway não configurada para este lojista.');
    }

    if (this.feesService) {
      try {
        await this.feesService.validateFeePercent(
          dto.installments,
          dto.feePercent,
          'VISA',
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
      amountInCents: dto.amount,
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
      amount: checkoutLink.amountInCents,
      gatewayResponse: cardResponse,
    };
  }

  /**
   * Consulta os dados de um checkout por ID ou externalReference
   */
  async getCheckoutByRef(externalReference: string) {
    return this.checkoutRepository.findOne({
      where: { externalReference },
    });
  }
}