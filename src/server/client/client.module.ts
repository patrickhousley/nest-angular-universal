import * as express from 'express';
import {
  Module,
  Inject,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { DynamicModule, NestModule, OnModuleInit } from '@nestjs/common/interfaces';
import { NestApplication } from '@nestjs/core';
import { HTTP_SERVER_REF } from '@nestjs/core/injector';
import { AngularUniversalOptions } from './interfaces/angular-universal-options.interface';
import { ANGULAR_UNIVERSAL_OPTIONS } from './client.constants';
import { ClientController } from './client.controller';
import { angularUniversalProviders } from './client.providers';
import { environment } from '../environments/environment';

@Module({
  controllers: [ClientController],
  providers: [...angularUniversalProviders],
})
export class ClientModule implements NestModule {
  constructor(
    @Inject(ANGULAR_UNIVERSAL_OPTIONS) private readonly ngOptions: AngularUniversalOptions,
    @Inject(HTTP_SERVER_REF) private readonly app: NestApplication
  ) {}

  static forRoot(): DynamicModule {
    const options: AngularUniversalOptions = {
      viewsPath: environment.clientPaths.client,
      bundle: require('../../main.server')
    };

    return {
      module: ClientModule,
      components: [
        {
          provide: ANGULAR_UNIVERSAL_OPTIONS,
          useValue: options,
        }
      ]
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    this.app.useStaticAssets(this.ngOptions.viewsPath);
  }
}
