"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const transaction_entity_1 = require("./entities/transaction.entity");
const audit_controller_1 = require("./audit.controller");
const audit_service_1 = require("./audit.service");
const audit_ledger_entity_1 = require("./entities/audit-ledger.entity");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                transaction_entity_1.PaymentTransaction,
                audit_ledger_entity_1.RegulatoryAuditLedger
            ])
        ],
        controllers: [payments_controller_1.PaymentsController, audit_controller_1.AuditController],
        providers: [payments_service_1.PaymentsService, audit_service_1.AuditService],
        exports: [payments_service_1.PaymentsService, audit_service_1.AuditService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map