import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeraBoxModule } from './modules/lera-box/lera-box.module';
import { AuthModule } from './modules/auth/auth.module';
import { FeesModule } from './modules/fees/fees.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    LeraBoxModule,
    AuthModule,
    FeesModule,
    CheckoutModule,
    WebhookModule,
    WalletModule,
    WithdrawalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
