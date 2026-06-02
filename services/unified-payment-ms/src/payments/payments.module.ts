// payments.module.ts — Módulo NestJS para el sistema de cobros multimodales ACID.
// Registra PaymentTransaction con TypeORM e importa AccountsModule para validar saldos.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentTransaction } from './entities/transaction.entity';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentTransaction]),
    AccountsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
