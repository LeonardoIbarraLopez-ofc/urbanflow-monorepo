import { PaymentsService, ChargeRequest } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    charge(dto: ChargeRequest): Promise<import("./payments.service").ChargeResult>;
}
