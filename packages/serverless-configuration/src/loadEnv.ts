import { config } from 'dotenv';
import { readdirSync } from 'fs';
import path from 'path';

import { sharedParams } from './sharedConfig';

const MAX_DEPTH = 10;

const findFile = (fileName: string, dirname = __dirname, depth = 0): string => {
  if (depth > MAX_DEPTH) {
    throw new Error(
      `file ${fileName} has not been found. Please create it at the root of the repo`,
    );
  }

  const foundFile = readdirSync(dirname).find(
    fileOrFolderName => fileOrFolderName === fileName,
  );
  if (foundFile !== undefined) {
    return path.resolve(dirname, foundFile);
  }
  const parentDir = path.resolve(dirname, '..');

  return findFile(fileName, parentDir, depth + 1);
};

export const loadEnv = (env: keyof typeof sharedParams): void => {
  const envFile = `.env.${env}`;
  console.info(`loading ${envFile}`);
  config({ path: findFile(envFile) });
};
