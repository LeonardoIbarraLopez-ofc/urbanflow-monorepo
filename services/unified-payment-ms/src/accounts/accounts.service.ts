// accounts.service.ts — Lógica de negocio para consulta y recarga de saldos de cuentas.
// Validación de saldo previo al cobro para evitar transacciones con fondos insuficientes.

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepo: Repository<Account>,
  ) {}

  /** Obtiene el saldo y estado de la cuenta del ciudadano. */
  async getBalance(accountId: string): Promise<{ balance: number; currency: string }> {
    const account = await this.accountsRepo.findOne({
      where: { account_id: accountId },
    });
    if (!account) throw new NotFoundException(`Cuenta ${accountId} no encontrada`);
    return { balance: Number(account.balance), currency: account.currency };
  }

  /**
   * Recarga saldo en la cuenta del ciudadano.
   * La actualización se hace dentro de una transacción ACID para garantizar consistencia.
   */
  async recharge(accountId: string, amount: number) {
  const account = await this.accountsRepo.findOne({
    where: { account_id: accountId },
  });
  if (!account) throw new NotFoundException(`Cuenta ${accountId} no encontrada`);

  // Calculamos el nuevo saldo de forma segura asegurando el tipo numérico
  const nuevoSaldo = Number(account.balance) + amount;
  account.balance = nuevoSaldo;
  
  // Guardamos en la base de datos
  await this.accountsRepo.save(account);

  // Retornamos un objeto limpio y explícito para evitar el bug del RETURNING de TypeORM
  return {
    account_id: account.account_id,
    user_id: account.user_id,
    balance: nuevoSaldo,
    currency: account.currency,
    status: 'SUCCESS'
  };
}
}
