import { Repository } from 'typeorm';
import { RegulatoryAuditLedger } from './entities/audit-ledger.entity';
export declare class AuditService {
    private readonly auditRepo;
    constructor(auditRepo: Repository<RegulatoryAuditLedger>);
    logEvent(eventType: string, payload: any): Promise<RegulatoryAuditLedger>;
}
