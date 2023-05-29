import { getHandler } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';

import { newPollContract } from 'contracts';
import { formatPollMessage } from 'libs/formatMessage';
import {
  applySlashCommandMiddleware,
  deleteMessage,
  postMessage,
} from 'libs/slack';
import {
  BOOKING_PK,
  BookingEntity,
  BookingEntityType,
  BookingStatus,
} from 'libs/table';

const ajv = new Ajv();

const handler = getHandler(newPollContract, { ajv })(async () => {
  const channelName = process.env.SLACK_CHANNEL_NAME;

  if (channelName === undefined) {
    throw new Error('Missing environment variables');
  }

  const { Items: onGoingBookings = [] } =
    await BookingEntity.query<BookingEntityType>(BOOKING_PK, {
      filters: [
        {
          attr: 'status',
          eq: BookingStatus.PENDING,
        },
      ],
    });

  const { messageId, channel } = await postMessage({
    channelName,
    message: formatPollMessage({ guests: [] }),
  });

  await Promise.all([
    ...onGoingBookings.map(({ messageId: mId }) =>
      BookingEntity.update({
        messageId: mId,
        status: BookingStatus.CANCELLED,
      }),
    ),
    BookingEntity.put({
      messageId,
      status: BookingStatus.PENDING,
      channel,
    }),
    ...onGoingBookings.map(({ messageId: mId, channel: messageChannel }) =>
      deleteMessage({ channel: messageChannel, messageId: mId }),
    ),
  ]);

  return {
    statusCode: 200,
    body: undefined,
  };
});

export const main = applySlashCommandMiddleware(handler);
