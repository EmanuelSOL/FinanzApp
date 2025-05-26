import * as crypto from 'crypto';

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = crypto.webcrypto || crypto;
}

(global as any).crypto = crypto;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina propiedades que no están en el DTO
    forbidNonWhitelisted: true, // Lanza un error si se envían propiedades no permitidas
    transform: true, // Transforma el payload a una instancia del DTO
    transformOptions: {
      enableImplicitConversion: true, // Permite conversión implícita de tipos
    },
  }));

  app.enableCors();


  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`La aplicación se está ejecutando en: ${await app.getUrl()}`);
}
bootstrap();
