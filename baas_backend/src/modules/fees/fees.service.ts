import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { LeraBoxService } from '../lera-box/lera-box.service';
import { GetFeesQueryDto, FeeOption } from './dto/get-fees-query.dto';

@Injectable()
export class FeesService {
  private readonly logger = new Logger(FeesService.name);

  constructor(private readonly leraBoxService: LeraBoxService) {}

  /**
   * Retorna as taxas vindas diretamente do Gateway Lera Box
   */
  async listFees(query: GetFeesQueryDto): Promise<FeeOption[]> {
    return this.leraBoxService.getFees(query.brand);
  }

  /**
   * Resolve o feePercent correto da tabela do gateway para a bandeira e número de parcelas.
   * A tabela do gateway é a fonte da verdade; nunca é estendida por valores fixos no frontend/backend.
   */
  async resolveFeePercent(installment: number, brand?: string): Promise<number> {
    const response = await this.leraBoxService.getFees(brand);
    const feesList = Array.isArray(response) ? response : response?.fees || [];

    if (!Array.isArray(feesList) || feesList.length === 0) {
      throw new BadRequestException('Tabela de taxas do gateway indisponível no momento.');
    }

    const normalizedBrand = brand?.toUpperCase();
    const exactMatches = feesList.filter((fee: any) => {
      const sameInstallment = Number(fee.installments) === Number(installment);
      const sameBrand = !normalizedBrand || fee.brand?.toUpperCase() === normalizedBrand;
      return sameInstallment && sameBrand;
    });

    const fallbackMatches = feesList.filter((fee: any) => Number(fee.installments) === Number(installment));
    const candidates = exactMatches.length > 0 ? exactMatches : fallbackMatches;

    if (candidates.length === 0) {
      throw new BadRequestException(
        `Número de parcelas (${installment}x) inválido para a bandeira informada.`,
      );
    }

    return Number(candidates[0].feePercent);
  }

  /**
   * Valida se a taxa e o número de parcelas informados conferem com a tabela do gateway
   */
  async validateFeePercent(installment: number, feePercent: number, brand?: string): Promise<boolean> {
    const expectedFee = await this.resolveFeePercent(installment, brand);
    const requested = Number(feePercent);

    if (Math.abs(expectedFee - requested) < 0.0001) {
      return true;
    }

    throw new BadRequestException(
      `Taxa de cartão incorreta para ${installment}x. A taxa atual do gateway é ${expectedFee}%.`,
    );
  }
}