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
const slackToken = process.env.SLACK_TOKEN;
const slackChannelName = process.env.SLACK_CHANNEL_NAME;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const bookingUserFirstName = process.env.BOOKING_USER_FIRST_NAME;
const bookingUserLastName = process.env.BOOKING_USER_LAST_NAME;
const bookingUserEmail = process.env.BOOKING_USER_EMAIL;
const bookingUserPhoneNumber = process.env.BOOKING_USER_PHONE_NUMBER;

if (
  restaurantId === undefined ||
  slackToken === undefined ||
  slackChannelName === undefined ||
  slackSigningSecret === undefined ||
  bookingUserFirstName === undefined ||
  bookingUserLastName === undefined ||
  bookingUserEmail === undefined ||
  bookingUserPhoneNumber === undefined
) {
  throw new Error('Missing environment variables');
}

new CoreStack(app, `${projectName}-core-${stage}`, {
  stage,
  env: { region },
  restaurantId,
  slackToken,
  slackChannelName,
  slackSigningSecret,
  bookingUserFirstName,
  bookingUserLastName,
  bookingUserEmail,
  bookingUserPhoneNumber,
});
