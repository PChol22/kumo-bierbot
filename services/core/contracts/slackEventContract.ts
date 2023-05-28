import {
  ApiGatewayContract,
  HttpStatusCodes,
} from '@swarmion/serverless-contracts';

// move this contract to a shared library once you need to use it outside this service
export const slackEventContract = new ApiGatewayContract({
  id: 'core-slack-event',
  path: '/slack-event',
  method: 'POST',
  integrationType: 'restApi',
  headersSchema: {
    type: 'object',
    properties: {
      'X-Slack-Signature': { type: 'string' },
      'X-Slack-Request-Timestamp': { type: 'string' },
    },
    required: ['X-Slack-Signature', 'X-Slack-Request-Timestamp'],
  } as const,
  bodySchema: {
    type: 'object',
    properties: {
      challenge: { type: 'string' },
    },
    required: ['challenge'],
  } as const,
  outputSchemas: {
    [HttpStatusCodes.OK]: { type: 'string' } as const,
  },
});
