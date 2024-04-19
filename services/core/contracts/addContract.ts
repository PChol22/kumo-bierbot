import {
  ApiGatewayContract,
  HttpStatusCodes,
} from '@swarmion/serverless-contracts';

import { slackHeaders } from './slackHeaders';

// move this contract to a shared library once you need to use it outside this service
export const addContract = new ApiGatewayContract({
  id: 'core-add',
  path: '/add',
  method: 'POST',
  integrationType: 'restApi',
  headersSchema: slackHeaders,
  bodySchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
      },
    },
    required: ['text'],
    additionalProperties: true,
  } as const,
  outputSchemas: {
    [HttpStatusCodes.OK]: {} as const,
  },
});
