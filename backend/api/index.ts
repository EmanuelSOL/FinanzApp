import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module'; 
import serverless from 'serverless-http';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

async function bootstrapServer(): Promise<any> {
  if (!cachedServer) {
    const expressApp = express();
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
  console.log(`Backend API handler invoked. Method: ${req.method}, URL: ${req.url}`);
  const server = await bootstrapServer();
  return server(req, res);
};