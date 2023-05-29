import { getHandler } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';

import { bookContract } from 'contracts';
import { applySlashCommandMiddleware, updateMessage } from 'libs/slack';
import {
  BOOKING_PK,
  BookingEntity,
  BookingEntityType,
  BookingStatus,
  getUserPk,
  UserEntityType,
} from 'libs/table';

const ajv = new Ajv();

const handler = getHandler(bookContract, { ajv })(async () => {
  const { Items: [onGoingBooking] = [] } =
    await BookingEntity.query<BookingEntityType>(BOOKING_PK, {
      filters: [
        {
          attr: 'status',
          eq: BookingStatus.PENDING,
        },
      ],
    });

  if (onGoingBooking === undefined) {
    return {
      statusCode: 200,
      body: 'No poll is currently ongoing',
    };
  }

  const { messageId, channel } = onGoingBooking;

  const { Items: acceptedUsers = [] } =
    await BookingEntity.query<UserEntityType>(getUserPk({ messageId }));

  await Promise.all([
    updateMessage({
      channel,
      messageId,
      message: `Le biergit est réservé pour ${
        acceptedUsers.length
      } personnes! ${acceptedUsers.map(({ name }) => name).join(', ')}`,
    }),
    BookingEntity.update({
      messageId,
      status: BookingStatus.DONE,
    }),
  ]);

  return {
    statusCode: 200,
    body: undefined,
  };
});

export const main = applySlashCommandMiddleware(handler);
