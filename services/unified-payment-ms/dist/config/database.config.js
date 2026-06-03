"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const account_entity_1 = require("../accounts/entities/account.entity");
const transaction_entity_1 = require("../payments/entities/transaction.entity");
const audit_ledger_entity_1 = require("../payments/entities/audit-ledger.entity");
const databaseConfig = () => ({
    type: 'postgres',
    url: 'postgresql://postgres:gatobyteselac0me@db.pjrpbcsogiqorkifivdr.supabase.co:5432/postgres',
    entities: [account_entity_1.Account, transaction_entity_1.PaymentTransaction, audit_ledger_entity_1.RegulatoryAuditLedger],
    synchronize: false,
    ssl: { rejectUnauthorized: false },
    extra: {
        max: 20,
    },
});
exports.default = databaseConfig;
//# sourceMappingURL=database.config.js.map