import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';
import { PaymentTransaction } from '../payments/entities/transaction.entity';
import { RegulatoryAuditLedger } from '../payments/entities/audit-ledger.entity';

const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  // Inyectamos la cadena directamente para saltarnos el problema del .env
  url: 'postgresql://postgres:gatobyteselac0me@db.pjrpbcsogiqorkifivdr.supabase.co:5432/postgres',
  entities: [Account, PaymentTransaction, RegulatoryAuditLedger],
  synchronize: false, 
  ssl: { rejectUnauthorized: false }, 
  extra: {
    max: 20,
  },
});

export default databaseConfig;