import { getHandler } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';

import { bookContract } from 'contracts';
import { applySlashCommandMiddleware } from 'libs/slack';

import { sharedHandler } from '../handler';

const ajv = new Ajv();

const handler = getHandler(bookContract, { ajv })(sharedHandler(false));

export const main = applySlashCommandMiddleware(handler);
