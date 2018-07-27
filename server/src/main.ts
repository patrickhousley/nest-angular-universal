import 'zone.js/dist/zone-node';
import { enableProdMode } from '@angular/core';
import { NestFactory } from '@nestjs/core';
import { environment } from '@nau/server/shared/config/environment';
import { swaggerConfig } from '@nau/server/shared/config/swagger.config';
import { ApplicationModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';

declare const module: any;

async function bootstrap() {
  if (environment.production) {
    enableProdMode();
  }

  const app = await NestFactory.create(ApplicationModule.moduleFactory());
  app.setGlobalPrefix('/api');
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, document);

  await app.listen(environment.port);
}

bootstrap()
  .then(() => console.log(`Server started on port ${environment.port}`))
  .catch(err => console.error(`Server startup failed`, err));
