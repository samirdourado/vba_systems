import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet, CheckoutLink } from '@/entities';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';



@Module({
  imports: [TypeOrmModule.forFeature([Wallet, CheckoutLink])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}