import { PaymentTransaction } from '../../payments/entities/transaction.entity';
export declare class Account {
    account_id: string;
    user_id: string;
    balance: number;
    currency: string;
    updated_at: Date;
    transactions: PaymentTransaction[];
}
