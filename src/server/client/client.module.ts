import * as express from 'express';
import {
  Module,
  Inject,
  RequestMethod,
} from '@nestjs/common';
import { DynamicModule, NestModule, OnModuleInit } from '@nestjs/common/interfaces';
import { NestApplication } from '@nestjs/core';
import { AngularUniversalOptions } from './interfaces/angular-universal-options.interface';
import { ANGULAR_UNIVERSAL_OPTIONS } from './client.constants';
import { ClientController } from './client.controller';
import { angularUniversalProviders } from './client.providers';
import {EXPRESS_REF } from '@nestjs/core/injector';
import {MiddlewaresConsumer} from '@nestjs/common/interfaces/middlewares';
import { environment } from '../environments/environment';

@Module({
  controllers: [ClientController],
  components: [...angularUniversalProviders],
})
export class ClientModule implements NestModule {
  constructor(
    @Inject(ANGULAR_UNIVERSAL_OPTIONS) private readonly ngOptions: AngularUniversalOptions,
    @Inject(EXPRESS_REF ) private readonly app: NestApplication
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

  configure(consumer: MiddlewaresConsumer): void {
    this.app.use(express.static(this.ngOptions.viewsPath));
  }
}
