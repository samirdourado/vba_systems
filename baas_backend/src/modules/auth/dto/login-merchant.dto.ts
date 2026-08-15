import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginMerchantDto {
  @ApiProperty({
    example: '39818816082',
    description: 'Merchant CPF or CNPJ',
  })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
