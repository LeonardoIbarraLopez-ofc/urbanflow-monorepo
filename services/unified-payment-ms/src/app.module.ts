// app.module.ts — Módulo raíz de unified-payment-ms (NestJS).
// Registra la conexión a Supabase PostgreSQL y los módulos de cuentas y pagos.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { PaymentsModule } from './payments/payments.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    // Carga de variables de entorno desde .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión TypeORM a Supabase PostgreSQL con pooling
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),

    AccountsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
