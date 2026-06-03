import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentTransaction } from './entities/transaction.entity';

// Importaciones del Ledger de Auditoría
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { RegulatoryAuditLedger } from './entities/audit-ledger.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentTransaction, 
      RegulatoryAuditLedger
    ])
  ],
  controllers: [PaymentsController, AuditController],
  providers: [PaymentsService, AuditService],
  exports: [PaymentsService, AuditService], // Opcional, por si otro módulo necesita inyectarlos
})
export class PaymentsModule {}