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
    },
    required: ['challenge'],
  } as const,
  outputSchemas: {
    [HttpStatusCodes.OK]: { type: 'string' } as const,
  },
});