import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { CheckoutLink, WebhookEvent } from '@/entities';
import { LeraBoxModule } from '../lera-box/lera-box.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutLink, WebhookEvent]),
    LeraBoxModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}