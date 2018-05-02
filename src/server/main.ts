import 'zone.js/dist/zone-node';
import { enableProdMode } from '@angular/core';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication, INestExpressApplication } from '@nestjs/common';
import { ApplicationModule } from './app.module';
import { environment } from './environments/environment';

let app: INestApplication & INestExpressApplication;

async function bootstrap() {
  if (environment.production) {
    enableProdMode();
  }

  app = await NestFactory.create(ApplicationModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(environment.port);
}
bootstrap();

export async function close() {
  if (app) {
    await app.close();
  }
}
