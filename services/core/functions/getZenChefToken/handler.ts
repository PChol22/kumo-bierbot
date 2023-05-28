import { getHandler, HttpStatusCodes } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';

import { getZenChefTokenContract } from 'contracts/getZenChefTokenContract';
import { getZenChefToken } from 'libs/zenchef';

const ajv = new Ajv();

export const main = getHandler(getZenChefTokenContract, { ajv })(async () => {
  const restaurantId = process.env.RESTAURANT_ID;

  if (restaurantId === undefined) {
    throw new Error('Missing restaurant ID');
  }

  const { token, timestamp } = await getZenChefToken({ restaurantId });

  return { statusCode: HttpStatusCodes.OK, body: { token, timestamp } };
});
