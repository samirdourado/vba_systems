import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'CPF ou CNPJ do titular', example: '12345678901' })
  @IsString()
  @IsNotEmpty({ message: 'O documento é obrigatório.' })
  document!: string;

  @ApiProperty({ description: 'E-mail cadastrado', example: 'maria@empresa.com' })
  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;
}