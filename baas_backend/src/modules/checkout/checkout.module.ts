import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CheckoutLink } from '@/entities';
import { LeraBoxModule } from '../lera-box/lera-box.module';
import { FeesModule } from '../fees/fees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutLink]),
    LeraBoxModule,
    FeesModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}