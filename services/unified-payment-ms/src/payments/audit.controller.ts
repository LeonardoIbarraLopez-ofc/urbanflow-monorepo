import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('log')
  @ApiOperation({
    summary: 'Registrar evento en el ledger',
    description: 'Guarda eventos de re-enrutamiento o cambio tarifario. El hash SHA-256 se genera en base de datos.',
  })
  logEvent(@Body() body: { eventType: string; payload: any }) {
    return this.auditService.logEvent(body.eventType, body.payload);
  }
}