import { getHandler } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';

import { slackEventContract } from 'contracts';
import { checkSignature } from 'libs/slack';

const ajv = new Ajv();

export const main = getHandler(slackEventContract, { ajv })(
  async ({ body, headers }) => {
    const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

    if (slackSigningSecret === undefined) {
      throw new Error('Missing slack signing secret');
    }

    console.log({ body, headers });

    const signature = checkSignature(
      headers['X-Slack-Request-Timestamp'],
      headers['X-Slack-Signature'],
      body,
      slackSigningSecret,
    );

    if (!signature) {
      throw new Error('Invalid signature');
    }

    const { challenge } = body;

    return Promise.resolve({ statusCode: 200, body: challenge });
  },
);
