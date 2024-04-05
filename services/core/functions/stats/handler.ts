import { getHandler } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';

import { statsContract } from 'contracts';
import { formatStatsMessage } from 'libs/formatMessage';
import { applySlashCommandMiddleware, postMessage } from 'libs/slack';
import { USER_ENTITY_NAME, UserEntity, UserEntityType } from 'libs/table';

const ajv = new Ajv();

const handler = getHandler(statsContract, { ajv })(async () => {
  const channelName = process.env.SLACK_CHANNEL_NAME;

  if (channelName === undefined) {
    throw new Error('Missing environment variables');
  }

  const [{ Items: users = [] }] = await Promise.all([
    UserEntity.scan<UserEntityType>({
      filters: { attr: 'PK', beginsWith: USER_ENTITY_NAME },
    }),
  ]);

  const userIdToName = users.reduce<Record<string, string>>((acc, user) => {
    acc[user.userId] = user.name;

    return acc;
  }, {});

  const countNumberOfComings = users.reduce<Record<string, number>>(
    (acc, user) => {
      if (acc[user.userId] === undefined) {
        acc[user.userId] = 1;
      } else {
        acc[user.userId] += 1;
      }

      return acc;
    },
    {},
  );

  const rankedTheodoers = Object.entries(countNumberOfComings)
    .sort(([, a], [, b]) => b - a)
    .map(([userId, numberOfComings]) => {
      return {
        name: userIdToName[userId] ?? 'bug detected',
        numberOfComings,
      };
    })
    .slice(0, 10);

  await postMessage({
    channelName,
    message: formatStatsMessage({ rankedTheodoers }),
  });

  return {
    statusCode: 200,
    body: undefined,
  };
});

export const main = applySlashCommandMiddleware(handler);
