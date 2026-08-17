import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export enum LeraBoxWebhookEventType {
  PAYMENT_PIX = 'PAYMENT_PIX',
  PAYMENT_CARD = 'PAYMENT_CARD',
  WITHDRAWAL = 'WITHDRAWAL',
}

export class CreateLeraBoxWebhookDto {
  @ApiProperty({
    description: 'Tipo de evento do gateway que acionará o envio da notificação',
    enum: LeraBoxWebhookEventType,
    enumName: 'LeraBoxWebhookEventType',
    example: LeraBoxWebhookEventType.PAYMENT_PIX,
  })
  @IsEnum(LeraBoxWebhookEventType, {
    message: 'O evento deve ser PAYMENT_PIX, PAYMENT_CARD ou WITHDRAWAL.',
  })
  event: LeraBoxWebhookEventType;

  @ApiPropertyOptional({
    description: 'URL do seu servidor que receberá os payloads de notificação. Se não for informada, usa PUBLIC_APP_URL + /api/webhooks/receiver',
    example: 'https://seu-sistema.com/api/webhooks/receiver',
  })
  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'A URL informada deve ser um endereço HTTP/HTTPS válido.' },
  )
  url?: string;

  @ApiPropertyOptional({
    description: 'Chave secreta opcional para validação de assinatura HMAC no receptor',
    example: 'minha_chave_secreta_hmac_123',
  })
  @IsOptional()
  @IsString({ message: 'O secret deve ser um texto (string).' })
  secret?: string;
}

export class ReceiveWebhookPayloadDto {
  @ApiPropertyOptional({
    description: 'ID único do evento/notificação (caso enviado pelo gateway)',
    example: '7054fd8d-1a02-42d3-9549-4da08f166636',
  })
  @IsOptional()
  @IsString({ message: 'O ID do evento deve ser um texto (string).' })
  id?: string;

  @ApiProperty({
    description: 'Nome do evento enviado pelo gateway',
    example: 'PAYMENT_PIX',
  })
  @IsString({ message: 'O nome do evento deve ser um texto (string).' })
  @IsNotEmpty({ message: 'O campo event é obrigatório.' })
  event: string;

  @ApiPropertyOptional({
    description: 'Status atual da cobrança ou transação (ex: APPROVED, DENIED, PENDING, EXPIRED)',
    example: 'DENIED',
  })
  @IsOptional()
  @IsString({ message: 'O status deve ser um texto (string).' })
  status?: string;

  @ApiPropertyOptional({
    description: 'ID único da transação gerado no gateway',
    example: 'aaa63c04-a5d2-443f-a339-08aa9d26ff20',
  })
  @IsOptional()
  @IsString({ message: 'O transactionId deve ser um texto (string).' })
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Identificador da transação no Pix (txid)',
    example: 'LB86FA348AD0BA3144F645',
  })
  @IsOptional()
  @IsString({ message: 'O txid deve ser um texto (string).' })
  txid?: string;

  @ApiPropertyOptional({
    description: 'Identificador do pedido/checkout gravado no seu banco local',
    example: 'PEDIDO-2',
  })
  @IsOptional()
  @IsString({ message: 'O externalReference deve ser um texto (string).' })
  externalReference?: string;

  @ApiPropertyOptional({
    description: 'Motivo da negação da transação',
    example: 'INSUFFICIENT_BALANCE',
  })
  @IsOptional()
  @IsString({ message: 'O denialReason deve ser um texto (string).' })
  denialReason?: string;

  @ApiPropertyOptional({
    description: 'Valor total em centavos',
    example: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O amount deve ser um número.' })
  amount?: number;

  @ApiPropertyOptional({
    description: 'Valor formatado para exibição',
    example: 'R$ 1,00',
  })
  @IsOptional()
  @IsString({ message: 'O amountFormatted deve ser um texto (string).' })
  amountFormatted?: string;

  @ApiPropertyOptional({
    description: 'Mensagem descritiva enviada pelo gateway',
    example: 'Transação negada por falta de saldo',
  })
  @IsOptional()
  @IsString({ message: 'A mensagem deve ser um texto (string).' })
  message?: string;

  @ApiPropertyOptional({
    description: 'Código do cliente no LeraBox',
    example: 840021,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O CodigoCliente deve ser um número.' })
  CodigoCliente?: number;

  @ApiPropertyOptional({
    description: 'Chave da loja no gateway',
    example: 'b83dfa78b3c1080ab7392a352604006e',
  })
  @IsOptional()
  @IsString({ message: 'A ChaveLoja deve ser um texto (string).' })
  ChaveLoja?: string;

  @ApiPropertyOptional({
    description: 'Objeto contendo metadados e detalhes adicionais da transação',
    example: {
      method: 'PIX',
      CodigoCliente: 840021,
      ChaveLoja: 'b83dfa78b3c1080ab7392a352604006e',
      payerDocument: '32112365401',
      externalReference: 'PEDIDO-2',
      txid: 'LB86FA348AD0BA3144F645',
    },
  })
  @IsOptional()
  @IsObject({ message: 'O campo metadata deve ser um objeto válido.' })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Data e hora do envio do evento ISO 8601',
    example: '2026-08-15T22:24:07.909Z',
  })
  @IsOptional()
  @IsString({ message: 'O campo occurredAt deve ser um texto (string).' })
  occurredAt?: string;

  @ApiPropertyOptional({
    description: 'Objeto com dados adicionais legado/compatibilidade',
  })
  @IsOptional()
  @IsObject({ message: 'O campo data deve ser um objeto válido.' })
  data?: Record<string, any>;
}