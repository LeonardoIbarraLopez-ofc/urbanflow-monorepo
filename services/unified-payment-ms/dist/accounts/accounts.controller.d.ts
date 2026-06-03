import { AccountsService } from './accounts.service';
declare class RechargeDto {
    amount: number;
}
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    getBalance(id: string): Promise<{
        balance: number;
        currency: string;
    }>;
    recharge(id: string, dto: RechargeDto): Promise<{
        account_id: string;
        user_id: string;
        balance: number;
        currency: string;
        status: string;
    }>;
}
export {};
