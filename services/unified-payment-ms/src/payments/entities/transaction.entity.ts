// transaction.entity.ts — Entidad TypeORM para la tabla 'payment_transactions' en Supabase.
// Registra cada cobro, reembolso o recarga con su monto, tipo y método de pago.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

export type TransactionType = 'CHARGE' | 'REFUND' | 'RECHARGE';
export type PaymentMethod = 'NFC_CARD' | 'MOBILE_APP' | 'QR_CODE';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @ManyToOne(() => Account, (account) => account.transactions)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'uuid' })
  account_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20 })
  transaction_type: TransactionType;

  @Column({ type: 'varchar', length: 20 })
  payment_method: PaymentMethod;

  // Respuesta raw del procesador de pago externo para auditoría
  @Column({ type: 'jsonb', nullable: true })
  provider_raw_response: object;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
