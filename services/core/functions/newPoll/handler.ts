import { getHandler } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';

import { newPollContract } from 'contracts';
import { applySlashCommandMiddleware, postMessage } from 'libs/slack';

const ajv = new Ajv();

const handler = getHandler(newPollContract, { ajv })(async ({ body }) => {
  const channelName = process.env.SLACK_CHANNEL_NAME;

  if (channelName === undefined) {
    throw new Error('Missing environment variables');
  }

  console.log({ body });

  await postMessage({ channelName, message: 'Hello world!' });

  return {
    statusCode: 200,
    body: 'Letsgooo!',
  };
});

export const main = applySlashCommandMiddleware(handler);
