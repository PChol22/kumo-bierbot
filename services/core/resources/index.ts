import { App } from 'aws-cdk-lib';

import {
  defaultEnvironment,
  loadEnv,
  projectName,
  region,
  sharedParams,
} from '@bierbot/serverless-configuration';

import { CoreStack } from './stack';

const app = new App();

const stage =
  (app.node.tryGetContext('stage') as keyof typeof sharedParams | undefined) ??
  defaultEnvironment;

loadEnv(stage);

const restaurantId = process.env.RESTAURANT_ID;

if (restaurantId === undefined) {
  throw new Error('Missing restaurant id');
}

new CoreStack(app, `${projectName}-core-${stage}`, {
  stage,
  env: { region },
  restaurantId,
});
