import {
  ApiGatewayContract,
  HttpStatusCodes,
} from '@swarmion/serverless-contracts';

import { slackHeaders } from './slackHeaders';

// move this contract to a shared library once you need to use it outside this service
export const newPollContract = new ApiGatewayContract({
  id: 'core-new-poll',
  path: '/new-poll',
  method: 'POST',
  integrationType: 'restApi',
  headersSchema: slackHeaders,
  bodySchema: {
    type: 'object',
  },
  outputSchemas: {
    [HttpStatusCodes.OK]: {} as const,
  },
});
