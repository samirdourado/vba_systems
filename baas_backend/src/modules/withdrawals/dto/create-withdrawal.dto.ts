import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ description: 'Valor do saque em centavos (ex: 10000 para R$ 100,00)', example: 10000 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({ description: 'Chave PIX de destino', example: '00020126580014br.gov.bcb.pix...' })
  @IsString()
  @IsNotEmpty()
  pixKey!: string;

  @ApiPropertyOptional({ description: 'Descrição do saque', example: 'Saque para conta pessoal' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Referência externa única', example: 'SAQUE-001' })
  @IsString()
  @IsOptional()
  externalReference?: string;

  @ApiPropertyOptional({ description: 'CPF/CNPJ do titular', example: '12345678901' })
  @IsString()
  @IsOptional()
  document?: string;
}