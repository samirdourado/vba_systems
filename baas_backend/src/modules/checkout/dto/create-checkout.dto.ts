import { IsInt, IsPositive, IsEnum, IsOptional, IsNumber, IsString, IsNotEmpty, Matches, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardBrand } from '@/modules/fees/dto/get-fees-query.dto';

export class CreatePixPaymentDto {
  @ApiProperty({ description: 'Valor da cobrança em centavos (ex: 1000 = R$ 10,00)', example: 1000 })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'CPF ou CNPJ do pagador (apenas números)', example: '12345678909' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\d{11}|\d{14})$/, { message: 'payerDocument deve ter 11 (CPF) ou 14 (CNPJ) dígitos' })
  payerDocument: string;

  @ApiPropertyOptional({ description: 'Descrição opcional da cobrança/pedido', example: 'Pagamento pedido 123' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Referência externa personalizada do cliente/pedido', example: 'PEDIDO-123' })
  @IsOptional()
  @IsString()
  externalReference?: string
}

export class CreateCardPaymentDto {
  @ApiProperty({ description: 'Valor total em centavos (ex: 25000 = R$ 250,00)', example: 25000 })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Número de parcelas (1 a 21)', example: 3 })
  @IsInt()
  @Min(1)
  @Max(21)
  installments: number;

  @ApiProperty({ description: 'Percentual da taxa obtido na consulta /fees', example: 3.19 })
  @IsNumber()
  @IsPositive()
  feePercent: number;

  @ApiProperty({ description: 'Número do cartão de crédito', example: '4111111111111111' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, { message: 'cardNumber inválido' })
  cardNumber: string;

  @ApiProperty({ description: 'Nome impresso no cartão', example: 'MARIA SILVA' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  cardHolder: string;

  @ApiProperty({ description: 'Mês de expiração (01-12)', example: '12' })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'expiryMonth inválido (01-12)' })
  expiryMonth: string;

  @ApiProperty({ description: 'Ano de expiração com 4 dígitos', example: '2030' })
  @IsString()
  @Matches(/^\d{4}$/, { message: 'expiryYear inválido' })
  expiryYear: string;

  @ApiProperty({ description: 'Código de segurança (CVV)', example: '123' })
  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'cvv inválido' })
  cvv: string;

  @ApiPropertyOptional({ description: 'Descrição opcional da compra', example: 'Compra loja online' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Referência externa personalizada do cliente/pedido', example: 'PEDIDO-456' })
  @IsOptional()
  @IsString()
  externalReference?: string;
}