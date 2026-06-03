import { EntityManager } from 'typeorm';
import { PaymentMethod } from './entities/transaction.entity';
export interface ChargeRequest {
    accountId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    tripId?: string;
}
export interface ChargeResult {
    transactionId: string;
    newBalance: number;
    status: 'SUCCESS' | 'FAILED';
}
export declare class PaymentsService {
    private readonly entityManager;
    constructor(entityManager: EntityManager);
    charge(request: ChargeRequest): Promise<ChargeResult>;
}
