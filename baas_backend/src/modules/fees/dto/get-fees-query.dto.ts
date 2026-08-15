import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum CardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  ELO = 'ELO',
}

export class GetFeesQueryDto {
  @ApiPropertyOptional({ enum: CardBrand, description: 'Bandeira do cartão' })
  @IsOptional()
  @IsEnum(CardBrand)
  brand?: CardBrand;
}

export interface FeeOption {
  installment: number;
  feePercent: number;
  brand?: string;
}