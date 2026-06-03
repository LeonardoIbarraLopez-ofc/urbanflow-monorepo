export interface Transaction {
  id: string;
  date: string;
  amount: number;
  mode: string;
  status: 'OK' | 'REJECTED';
}

export interface PaymentHistoryResponse {
  transactions: Transaction[];
}

export interface BalanceResponse {
  user_id: string;
  balance: number;
  currency: 'USD';
}

export interface ChargeRequest {
  user_id: string;
  route_id: string;
  segments: any[];
  total_amount: number;
}

export interface ChargeResponse {
  success: boolean;
  new_balance?: number;
  transaction_id?: string;
  error?: 'INSUFFICIENT_FUNDS';
}
