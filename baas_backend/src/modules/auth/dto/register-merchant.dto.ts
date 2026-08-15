import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterMerchantDto {
  @ApiProperty({ example: 'PF', description: 'PF ou PJ' })
  @IsString()
  @IsNotEmpty()
  personType!: 'PF' | 'PJ';

  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Loja da Maria' })
  @IsOptional()
  @IsString()
  tradingName?: string;

  @ApiProperty({ example: 'maria@empresa.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '11999998888' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '12345678901', description: 'CPF ou CNPJ (somente números)' })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({ example: 'Mudar123*' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: '01310100' })
  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @ApiProperty({ example: 'Av. Paulista' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiPropertyOptional({ example: 'Sala 12' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ example: 'Bela Vista' })
  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state!: string;
}