"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_entity_1 = require("../accounts/entities/account.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
let PaymentsService = class PaymentsService {
    constructor(entityManager) {
        this.entityManager = entityManager;
    }
    async charge(request) {
        return this.entityManager.transaction(async (txManager) => {
            const account = await txManager
                .getRepository(account_entity_1.Account)
                .createQueryBuilder('account')
                .where('account.account_id = :id', { id: request.accountId })
                .setLock('pessimistic_write')
                .getOne();
            if (!account) {
                throw new common_1.BadRequestException(`Cuenta ${request.accountId} no encontrada`);
            }
            const currentBalance = Number(account.balance);
            if (currentBalance < request.amount) {
                throw new common_1.BadRequestException(`Saldo insuficiente: disponible ${currentBalance}, requerido ${request.amount}`);
            }
            account.balance = currentBalance - request.amount;
            await txManager.save(account_entity_1.Account, account);
            const tx = txManager.create(transaction_entity_1.PaymentTransaction, {
                account_id: request.accountId,
                amount: request.amount,
                transaction_type: 'CHARGE',
                payment_method: request.paymentMethod,
            });
            const savedTx = await txManager.save(transaction_entity_1.PaymentTransaction, tx);
            return {
                transactionId: savedTx.transaction_id,
                newBalance: Number(account.balance),
                status: 'SUCCESS',
            };
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeorm_2.EntityManager])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map