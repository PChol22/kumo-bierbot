import { getHandler } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';

import { slackEventContract } from 'contracts';
import { applySlackEventMiddleware } from 'libs/slack';

const ajv = new Ajv();

const handler = getHandler(slackEventContract, { ajv })(async ({ body }) => {
  console.log({ body });

  const { challenge } = body;

  return Promise.resolve({ statusCode: 200, body: challenge });
});

export const main = applySlackEventMiddleware(handler);
