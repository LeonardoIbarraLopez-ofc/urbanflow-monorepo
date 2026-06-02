// payments.controller.ts — Endpoint REST para cobros multimodales.
// POST /payments/charge — Descuenta el costo del viaje con garantía ACID.
// Acepta pagos por NFC_CARD, MOBILE_APP y QR_CODE.

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService, ChargeRequest } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('charge')
  @ApiOperation({
    summary: 'Cobrar tarifa de viaje multimodal',
    description: 'Descuenta el monto del viaje del saldo del ciudadano en una transacción ACID. Soporta NFC, App y QR.',
  })
  charge(@Body() dto: ChargeRequest) {
    return this.paymentsService.charge(dto);
  }
}
