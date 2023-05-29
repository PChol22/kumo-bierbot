import middy, { MiddlewareObj } from '@middy/core';
import httpUrlEncodeBodyParser from '@middy/http-urlencode-body-parser';
import { ApiGatewayHandler } from '@swarmion/serverless-contracts';

import { checkSignature } from './checkSignature';

const signingSecretMiddleware: () => MiddlewareObj<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  Error,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
> = () => ({
  before: (handler: {
    event: {
      body: unknown;
      headers: {
        'X-Slack-Request-Timestamp': string;
        'X-Slack-Signature': string;
      };
    };
  }) => {
    const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

    if (slackSigningSecret === undefined) {
      throw new Error('Missing environment variables');
    }

    const signature = checkSignature(
      handler.event.headers['X-Slack-Signature'],
      handler.event.headers['X-Slack-Request-Timestamp'],
      handler.event.body as string,
      slackSigningSecret,
    );

    if (!signature) {
      throw new Error('Invalid signature');
    }
  },
});

const stringifyBodyMiddleware: () => MiddlewareObj<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  Error,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
> = () => ({
  before: (handler: { event: { body: unknown } }) => {
    if (handler.event.body !== undefined) {
      handler.event.body = JSON.stringify(handler.event.body);
    }
  },
});

export const applySlackEventMiddleware = <T>(
  handler: ApiGatewayHandler<'restApi', undefined, T, []>,
): ApiGatewayHandler<'restApi', undefined, T, []> => {
  const main = middy(handler);

  main.use(signingSecretMiddleware());

  return main;
};

export const applySlashCommandMiddleware = <T>(
  handler: ApiGatewayHandler<'restApi', undefined, T, []>,
): ApiGatewayHandler<'restApi', undefined, T, []> => {
  const main = middy(handler);

  main
    .use(signingSecretMiddleware())
    .use(httpUrlEncodeBodyParser())
    .use(stringifyBodyMiddleware());

  return main;
};
