// account.entity.ts — Entidad TypeORM para la tabla 'accounts' en Supabase PostgreSQL.
// Representa la billetera virtual del ciudadano con saldo y restricción CHECK (balance >= 0).

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PaymentTransaction } from '../../payments/entities/transaction.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  account_id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  // NUMERIC(12,2) con check constraint en DB — TypeORM sincroniza la columna pero el CHECK lo maneja la migración SQL
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => PaymentTransaction, (tx) => tx.account)
  transactions: PaymentTransaction[];
}
