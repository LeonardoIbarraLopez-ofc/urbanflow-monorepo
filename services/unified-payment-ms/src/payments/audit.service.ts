import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegulatoryAuditLedger } from './entities/audit-ledger.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(RegulatoryAuditLedger)
    private readonly auditRepo: Repository<RegulatoryAuditLedger>,
  ) {}

  async logEvent(eventType: string, payload: any) {
    const logEntry = this.auditRepo.create({
      event_type: eventType,
      payload,
    });
    return this.auditRepo.save(logEntry);
  }
}