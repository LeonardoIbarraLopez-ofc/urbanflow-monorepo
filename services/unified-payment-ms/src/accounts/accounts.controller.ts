// accounts.controller.ts — Endpoints REST para gestión de cuentas y saldos.
// GET  /accounts/:id/balance — Consulta el saldo actual del ciudadano
// POST /accounts/:id/recharge — Recarga saldo vía entidad bancaria autorizada

import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';

class RechargeDto {
  amount: number;
}

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(':id/balance')
  @ApiOperation({ summary: 'Consultar saldo de la cuenta del ciudadano' })
  getBalance(@Param('id') id: string) {
    return this.accountsService.getBalance(id);
  }

  @Post(':id/recharge')
  @ApiOperation({ summary: 'Recargar saldo en la cuenta del ciudadano' })
  recharge(@Param('id') id: string, @Body() dto: RechargeDto) {
    return this.accountsService.recharge(id, dto.amount);
  }
}
