import { API_CONFIG } from '../config/api.config';
import { ChargeRequest, ChargeResponse, BalanceResponse, PaymentHistoryResponse } from '../types/payment.types';

const isUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// ─── Operación 1: Consultar Saldo ────────────────────────────────────────────
// GET /accounts/:id/balance → { balance, currency }
export const getBalance = async (userId: string): Promise<BalanceResponse> => {
  if (!isUUID(userId)) return { user_id: userId, balance: 10.50, currency: 'USD' };
  try {
    const res = await fetch(`${API_CONFIG.PAYMENT}/accounts/${userId}/balance`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { user_id: userId, balance: data.balance, currency: data.currency ?? 'USD' };
  } catch {
    return { user_id: userId, balance: 10.50, currency: 'USD' };
  }
};

// ─── Operación 2: Recargar Saldo ─────────────────────────────────────────────
// POST /accounts/:id/recharge  body: { amount }
// El MS no usa paymentMethod en recarga — solo necesita el monto
export const rechargeAccount = async (
  userId: string,
  amount: number,
  _method: string
): Promise<{ success: boolean; new_balance: number }> => {
  if (!isUUID(userId)) return { success: true, new_balance: 10.50 + amount };
  try {
    const res = await fetch(`${API_CONFIG.PAYMENT}/accounts/${userId}/recharge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // MS devuelve { account_id, user_id, balance, currency, status }
    const data = await res.json();
    return { success: true, new_balance: data.balance ?? 0 };
  } catch {
    return { success: true, new_balance: 10.50 + amount };
  }
};

// ─── Operaciones 3 y 4: Cobrar Tarifa (éxito / saldo insuficiente) ───────────
// POST /payments/charge  body: { accountId, amount, paymentMethod, tripId? }
// MS éxito:   { transactionId, newBalance, status: 'SUCCESS' }
// MS error:   HTTP 400 { message: "Saldo insuficiente: disponible X, requerido Y" }
export const chargeTrip = async (req: ChargeRequest): Promise<ChargeResponse> => {
  if (!isUUID(req.user_id)) {
    if (req.total_amount > 20) return { success: false, error: 'INSUFFICIENT_FUNDS' };
    return { success: true, new_balance: 10.50 - req.total_amount, transaction_id: 'TX-MOCK' };
  }
  try {
    const res = await fetch(`${API_CONFIG.PAYMENT}/payments/charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId:     req.user_id,
        amount:        req.total_amount,
        paymentMethod: 'MOBILE_APP',
        tripId:        req.route_id,
      }),
    });

    if (res.status === 400) {
      const err = await res.json();
      const isInsufficient = typeof err.message === 'string' &&
        err.message.toLowerCase().includes('saldo insuficiente');
      return { success: false, error: isInsufficient ? 'INSUFFICIENT_FUNDS' : 'INSUFFICIENT_FUNDS' };
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    // Operación 5: registrar en el cripto-ledger tras cobro exitoso
    logAuditEvent('PAYMENT_CHARGE', {
      accountId:     req.user_id,
      tripId:        req.route_id,
      amount:        req.total_amount,
      transactionId: data.transactionId,
    });

    return {
      success:        true,
      new_balance:    data.newBalance,
      transaction_id: data.transactionId,
    };
  } catch {
    if (req.total_amount > 20) return { success: false, error: 'INSUFFICIENT_FUNDS' };
    return { success: true, new_balance: 10.50 - req.total_amount, transaction_id: 'TX-MOCK' };
  }
};

// ─── Operación 5: Cripto-Ledger de auditoría ─────────────────────────────────
// POST /audit/log  body: { eventType, payload }
// Llamado internamente tras cada cobro exitoso (trazabilidad regulatoria)
const logAuditEvent = (eventType: string, payload: object): void => {
  fetch(`${API_CONFIG.PAYMENT}/audit/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, payload }),
  }).catch(() => {
    // No bloquear el flujo principal si el ledger falla
  });
};

// ─── Historial de transacciones (mock — sin endpoint en el MS) ────────────────
export const getPaymentHistory = async (_userId: string): Promise<PaymentHistoryResponse> => {
  return {
    transactions: [
      { id: 'T-1', date: new Date().toISOString(),                         amount: 0.8,  mode: 'BUS', status: 'OK' },
      { id: 'T-2', date: new Date(Date.now() - 86400000).toISOString(),    amount: 50.0, mode: 'APP', status: 'REJECTED' },
    ],
  };
};
