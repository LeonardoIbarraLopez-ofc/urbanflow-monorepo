// database.config.ts — Configuración TypeORM para Supabase PostgreSQL.
// Usa la variable SUPABASE_DB_URL para conectar al clúster Supabase Free-Tier.
// En desarrollo local apunta al contenedor Postgres del docker-compose.

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';
import { PaymentTransaction } from '../payments/entities/transaction.entity';

const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
  entities: [Account, PaymentTransaction],
  // Sincronización automática de schema solo en desarrollo
  synchronize: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  // Pool de conexiones para soportar carga concurrente
  poolSize: 20,
  connectTimeoutMS: 5000,
});

export default databaseConfig;
