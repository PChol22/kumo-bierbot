import {
  ApiGatewayContract,
  HttpStatusCodes,
} from '@swarmion/serverless-contracts';

import { slackHeaders } from './slackHeaders';

// move this contract to a shared library once you need to use it outside this service
export const bookContract = new ApiGatewayContract({
  id: 'core-book',
  path: '/book',
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
