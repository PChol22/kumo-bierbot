import {
  ApiGatewayContract,
  HttpStatusCodes,
} from '@swarmion/serverless-contracts';

import { slackHeaders } from './slackHeaders';

// move this contract to a shared library once you need to use it outside this service
export const slackEventContract = new ApiGatewayContract({
  id: 'core-slack-event',
  path: '/slack-event',
  method: 'POST',
  integrationType: 'restApi',
  headersSchema: slackHeaders,
  bodySchema: {
    type: 'object',
    properties: {
      challenge: { type: 'string' },
      event: {
        type: 'object',
        properties: {
          type: { enum: ['reaction_added', 'reaction_removed'] },
          item: {
            type: 'object',
            properties: {
              ts: { type: 'string' },
            },
            required: ['ts'],
          },
          reaction: { type: 'string' },
          user: { type: 'string' },
        },
        required: ['type', 'item', 'reaction', 'user'],
      },
    },
  } as const,
  outputSchemas: {
    [HttpStatusCodes.OK]: { type: 'string' } as const,
  },
});
