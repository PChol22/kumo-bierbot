import {
  ApiGatewayContract,
  HttpStatusCodes,
} from '@swarmion/serverless-contracts';

import { slackHeaders } from './slackHeaders';

// move this contract to a shared library once you need to use it outside this service
export const statsContract = new ApiGatewayContract({
  id: 'core-stats',
  path: '/stats',
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
