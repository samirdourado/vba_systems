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
   * Valida se a taxa e o número de parcelas informados conferem com a tabela do gateway
   */
  async validateFeePercent(installment: number, feePercent: number, brand?: string): Promise<boolean> {
    const fees: FeeOption[] = await this.leraBoxService.getFees(brand);

    const feeConfig = fees.find((fee) => Number(fee.installment) === Number(installment));

    if (!feeConfig) {
      throw new BadRequestException(`Número de parcelas (${installment}x) inválido ou não suportado.`);
    }

    if (Number(feeConfig.feePercent) !== Number(feePercent)) {
      this.logger.warn(
        `Divergência de taxa detectada. Esperado: ${feeConfig.feePercent}%, Recebido: ${feePercent}%`,
      );
      throw new BadRequestException(
        `Taxa de cartão incorreta para ${installment}x. A taxa atual é ${feeConfig.feePercent}%.`,
      );
    }

    return true;
  }
}