// main.ts — Punto de entrada de unified-payment-ms (NestJS).
// Arranca el servidor HTTP en el puerto configurado.
// Este microservicio gestiona cuentas de usuario, saldos y cobros multimodales ACID.

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global de DTOs usando class-validator
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Documentación Swagger/OpenAPI para contrato API-First
  const config = new DocumentBuilder()
    .setTitle('UrbanFlow Payment MS')
    .setDescription('API de pagos unificados multimodales con garantía ACID (NFC, App, QR)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PAYMENT_PORT ?? 3000;
  await app.listen(port);
  console.log(`unified-payment-ms corriendo en puerto ${port}`);
}

bootstrap();
