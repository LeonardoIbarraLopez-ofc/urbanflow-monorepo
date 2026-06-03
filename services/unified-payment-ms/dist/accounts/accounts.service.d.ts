import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
export declare class AccountsService {
    private readonly accountsRepo;
    constructor(accountsRepo: Repository<Account>);
    getBalance(accountId: string): Promise<{
        balance: number;
        currency: string;
    }>;
    recharge(accountId: string, amount: number): Promise<{
        account_id: string;
        user_id: string;
        balance: number;
        currency: string;
        status: string;
    }>;
}
