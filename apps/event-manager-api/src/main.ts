/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from './app/app.module';
import { bootstrapLocal } from './core/config';
import { environment } from './environments/environment';

export let api = undefined;
export let createNestServer = undefined;

if (environment.firebaseSetup) {
  const server = express();

  createNestServer = async (expressInstance) => {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressInstance),
      { cors: true }
    );

    return app.init();
  };

  createNestServer(server)
    .then((v) => console.log('Nest Ready'))
    .catch((err) => console.error('Nest broken', err));

  // Connect express server to Firebase Functions
  api = functions.https.onRequest(server);
} else {
  bootstrapLocal();
}
