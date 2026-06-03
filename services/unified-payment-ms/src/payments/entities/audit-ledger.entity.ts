import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('regulatory_audit_ledger')
export class RegulatoryAuditLedger {
  @PrimaryGeneratedColumn('increment')
  sequence_id: number;

  @Column({ type: 'varchar', length: 50 })
  event_type: string;

  @Column({ type: 'jsonb' })
  payload: object;

  // No necesitamos insertar previous_hash ni current_hash manualmente,
  // el trigger de PostgreSQL lo hará por nosotros de forma segura.

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}