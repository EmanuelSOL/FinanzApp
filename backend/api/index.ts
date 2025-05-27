import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module'; 
import * as serverless from 'serverless-http';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common'; 

let cachedServer: any;

async function bootstrapServer(): Promise<any> {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    nestApp.enableCors(); // Ejemplo: Habilitar CORS

    // Es importante aplicar el ValidationPipe global aquí también si tu main.ts lo hacía
    nestApp.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })); //

    await nestApp.init();
    cachedServer = serverless(expressApp);
  }
  return cachedServer;
}

export default async (req: any, res: any) => {
  const server = await bootstrapServer();
  return server(req, res);
};

