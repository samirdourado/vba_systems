import { FeesService } from './fees.service';

describe('FeesService', () => {
  let service: FeesService;
  let leraBoxService: { getFees: jest.Mock };

  beforeEach(() => {
    leraBoxService = {
      getFees: jest.fn().mockResolvedValue({
        fees: [
          { brand: 'VISA', installments: 1, feePercent: 1.19 },
          { brand: 'VISA', installments: 3, feePercent: 3.19 },
          { brand: 'MASTERCARD', installments: 1, feePercent: 1.29 },
          { brand: 'MASTERCARD', installments: 3, feePercent: 3.45 },
          { brand: 'ELO', installments: 1, feePercent: 1.39 },
          { brand: 'ELO', installments: 3, feePercent: 3.69 },
          { brand: 'ELO', installments: 21, feePercent: 12.89 },
        ],
      }),
    };

    service = new FeesService(leraBoxService as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('resolves the exact gateway fee for each brand and installment', async () => {
    await expect(service.resolveFeePercent(3, 'VISA')).resolves.toBe(3.19);
    await expect(service.resolveFeePercent(3, 'MASTERCARD')).resolves.toBe(3.45);
    await expect(service.resolveFeePercent(3, 'ELO')).resolves.toBe(3.69);
    await expect(service.resolveFeePercent(21, 'ELO')).resolves.toBe(12.89);
  });

  it('covers every supported installment from 1 to 21 for every supported brand', async () => {
    const brands = ['VISA', 'MASTERCARD', 'ELO'];
    const feesByBrand = {
      VISA: Array.from({ length: 21 }, (_, index) => ({
        brand: 'VISA',
        installments: index + 1,
        feePercent: Number((index + 1) * 0.5 + 0.19),
      })),
      MASTERCARD: Array.from({ length: 21 }, (_, index) => ({
        brand: 'MASTERCARD',
        installments: index + 1,
        feePercent: Number((index + 1) * 0.48 + 0.27),
      })),
      ELO: Array.from({ length: 21 }, (_, index) => ({
        brand: 'ELO',
        installments: index + 1,
        feePercent: Number((index + 1) * 0.55 + 0.31),
      })),
    };

    leraBoxService.getFees.mockImplementation(async (brand?: string) => ({
      fees: brand ? feesByBrand[brand as keyof typeof feesByBrand] : Object.values(feesByBrand).flat(),
    }));

    for (const brand of brands) {
      for (let installment = 1; installment <= 21; installment += 1) {
        const expected = feesByBrand[brand as keyof typeof feesByBrand].find(
          (fee) => fee.installments === installment,
        )?.feePercent;

        await expect(service.resolveFeePercent(installment, brand)).resolves.toBe(expected);
      }
    }
  });

  it('accepts the gateway fee and rejects mismatched values for all supported brands', async () => {
    await expect(service.validateFeePercent(3, 3.19, 'VISA')).resolves.toBe(true);
    await expect(service.validateFeePercent(3, 3.45, 'MASTERCARD')).resolves.toBe(true);
    await expect(service.validateFeePercent(3, 3.69, 'ELO')).resolves.toBe(true);

    await expect(service.validateFeePercent(3, 3.45, 'VISA')).rejects.toThrow(
      'Taxa de cartão incorreta para 3x. A taxa atual do gateway é 3.19%.'
    );
  });
});
