import { Account } from '../../accounts/entities/account.entity';
export type TransactionType = 'CHARGE' | 'REFUND' | 'RECHARGE';
export type PaymentMethod = 'NFC_CARD' | 'MOBILE_APP' | 'QR_CODE';
export declare class PaymentTransaction {
    transaction_id: string;
    account: Account;
    account_id: string;
    amount: number;
    transaction_type: TransactionType;
    payment_method: PaymentMethod;
    provider_raw_response: object;
    created_at: Date;
}
