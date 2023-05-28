import {
  ApiGatewayContract,
  HttpStatusCodes,
} from '@swarmion/serverless-contracts';

// move this contract to a shared library once you need to use it outside this service
export const getZenChefTokenContract = new ApiGatewayContract({
  id: 'core-get-zen-chef-token',
  path: '/zen-chef-token',
  method: 'GET',
  integrationType: 'restApi',
  outputSchemas: {
    [HttpStatusCodes.OK]: {
      type: 'object',
      properties: { token: { type: 'string' }, timestamp: { type: 'string' } },
      required: ['token', 'timestamp'],
      additionalProperties: false,
    } as const,
  },
});
