import { getHandler } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';
import { randomUUID } from 'crypto';

import { addContract } from 'contracts';
import { formatPollMessage } from 'libs/formatMessage';
import { applySlashCommandMiddleware, updateMessage } from 'libs/slack';
import {
  BOOKING_PK,
  BookingEntity,
  BookingStatus,
  getUserPk,
  UserEntity,
  UserEntityType,
} from 'libs/table';

const ajv = new Ajv();

const handler = getHandler(addContract, { ajv })(async ({ body: { text } }) => {
  const channelName = process.env.SLACK_CHANNEL_NAME;

  if (channelName === undefined) {
    throw new Error('Missing environment variables');
  }

  const { Items = [] } = await BookingEntity.query(BOOKING_PK);

  const [firstItem] = [...Items].sort((a, b) =>
    a.created > b.created ? -1 : 1,
  );

  if (firstItem?.status === BookingStatus.DONE) {
    return {
      statusCode: 200,
      body: undefined,
    };
  }

  if (firstItem === undefined) {
    throw new Error('No booking found');
  }

  await UserEntity.put({
    messageId: firstItem.messageId,
    userId: randomUUID(),
    name: text,
  });

  const { Items: allUsers = [] } = await UserEntity.query<UserEntityType>(
    getUserPk({ messageId: firstItem.messageId }),
  );

  await updateMessage({
    messageId: firstItem.messageId,
    channel: firstItem.channel,
    message: formatPollMessage({
      guests: allUsers.map(({ name }) => name),
      scheduleTime: firstItem.scheduleTime,
    }),
  });

  return {
    statusCode: 200,
    body: undefined,
  };
});

export const main = applySlashCommandMiddleware(handler);
