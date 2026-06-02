// payments.service.ts — Lógica transaccional ACID de cobros multimodales.
// Implementa el principio "todo o nada": verifica saldo, descuenta y registra
// la transacción en una única transacción PostgreSQL atómica.
// Si hay saldo insuficiente o error de red, el rollback garantiza consistencia.

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Account } from '../accounts/entities/account.entity';
import { PaymentTransaction, PaymentMethod } from './entities/transaction.entity';

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

@Injectable()
export class PaymentsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Cobra el monto del viaje multimodal en una transacción PostgreSQL ACID.
   * Validación 1.3: si el saldo es insuficiente, lanza excepción y hace rollback.
   */
  async charge(request: ChargeRequest): Promise<ChargeResult> {
    return this.entityManager.transaction(async (txManager) => {
      // Bloquear la fila de la cuenta para escritura exclusiva durante la transacción
      const account = await txManager
        .getRepository(Account)
        .createQueryBuilder('account')
        .where('account.account_id = :id', { id: request.accountId })
        .setLock('pessimistic_write')
        .getOne();

      if (!account) {
        throw new BadRequestException(`Cuenta ${request.accountId} no encontrada`);
      }

      const currentBalance = Number(account.balance);
      if (currentBalance < request.amount) {
        // Saldo insuficiente: la excepción causa rollback automático
        throw new BadRequestException(
          `Saldo insuficiente: disponible ${currentBalance}, requerido ${request.amount}`,
        );
      }

      // Descontar saldo
      account.balance = currentBalance - request.amount;
      await txManager.save(Account, account);

      // Registrar la transacción en el ledger histórico
      const tx = txManager.create(PaymentTransaction, {
        account_id: request.accountId,
        amount: request.amount,
        transaction_type: 'CHARGE',
        payment_method: request.paymentMethod,
      });
      const savedTx = await txManager.save(PaymentTransaction, tx);

      return {
        transactionId: savedTx.transaction_id,
        newBalance: Number(account.balance),
        status: 'SUCCESS',
      };
    });
  }
}
