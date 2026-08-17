import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CheckoutService } from './checkout.service';
import { CheckoutLink, User } from '@/entities';
import { LeraBoxService } from '../lera-box/lera-box.service';
import { FeesService } from '../fees/fees.service';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let leraBoxService: { createPixPayment: jest.Mock; registerWebhook: jest.Mock; listWebhooks: jest.Mock };
  let checkoutRepository: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    checkoutRepository = {
      create: jest.fn((dto) => ({ ...dto, id: 'checkout-id' })),
      save: jest.fn(async (dto) => dto),
    };

    leraBoxService = {
      createPixPayment: jest.fn().mockResolvedValue({ id: 'gateway-payment-id', qrCodeBase64: 'abc' }),
      registerWebhook: jest.fn().mockResolvedValue({ ok: true }),
      listWebhooks: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: getRepositoryToken(CheckoutLink),
          useValue: checkoutRepository,
        },
        {
          provide: LeraBoxService,
          useValue: leraBoxService,
        },
        {
          provide: FeesService,
          useValue: {
            validateFeePercent: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PUBLIC_APP_URL') return 'https://ngrok.example.com';
              if (key === 'WEBHOOK_SECRET') return 'secret-webhook';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers the pix webhook when creating a Pix checkout', async () => {
    const user = {
      id: 'user-id',
      gatewayAccount: { token: 'gateway-token' },
    } as User;

    await service.processPixPayment(user, {
      amount: 100,
      payerDocument: '12345678909',
      externalReference: 'REF-123',
    });

    expect(leraBoxService.registerWebhook).toHaveBeenCalledWith('gateway-token', {
      event: 'PAYMENT_PIX',
      url: 'https://ngrok.example.com/api/webhooks/receiver',
      secret: 'secret-webhook',
    });
  });
});
