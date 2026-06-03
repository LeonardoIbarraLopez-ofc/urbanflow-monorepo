import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    logEvent(body: {
        eventType: string;
        payload: any;
    }): Promise<import("./entities/audit-ledger.entity").RegulatoryAuditLedger>;
}
