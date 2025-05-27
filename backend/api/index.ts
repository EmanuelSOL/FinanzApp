import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module'; // Ajusta la ruta a tu AppModule
import serverless from 'serverless-http'; // CAMBIO AQUÍ
import express from 'express';             // CAMBIO AQUÍ
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

async function bootstrapServer(): Promise<any> {
  if (!cachedServer) {
    const expressApp = express(); // Ahora express() es la función correcta
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    
    nestApp.enableCors(); 
    
    nestApp.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    await nestApp.init();
    cachedServer = serverless(expressApp); 
  }
  return cachedServer;
}

export default async (req: any, res: any) => {
  const server = await bootstrapServer();
  return server(req, res);
};

