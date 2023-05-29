import { getHandler } from '@swarmion/serverless-contracts';
import Ajv from 'ajv';

import { slackEventContract } from 'contracts';
import { PK, SK } from 'libs/constants';
import {
  applySlackEventMiddleware,
  getUserName,
  updateMessage,
} from 'libs/slack';
import {
  BOOKING_PK,
  BookingEntity,
  BookingEntityType,
  BookingStatus,
  getUserPk,
  UserEntity,
  UserEntityType,
} from 'libs/table';

const ajv = new Ajv();

const handler = getHandler(slackEventContract, { ajv })(async ({ body }) => {
  const { challenge, event } = body;

  if (challenge !== undefined) {
    return Promise.resolve({ statusCode: 200, body: challenge });
  }

  if (event?.reaction !== 'beers') {
    console.log('Wrong reaction');

    return Promise.resolve({ statusCode: 200, body: 'Wrong reaction' });
  }

  const {
    type,
    user: userId,
    item: { ts: messageId },
  } = event;

  const [{ Items: acceptedUsers = [] }, userName, { Item: matchingBooking }] =
    await Promise.all([
      UserEntity.query<UserEntityType>(getUserPk({ messageId })),
      getUserName(userId),
      BookingEntity.get<BookingEntityType>({
        [PK]: BOOKING_PK,
        [SK]: messageId,
      }),
    ]);

  if (matchingBooking?.status !== BookingStatus.PENDING) {
    console.log('Booking is not pending');

    return Promise.resolve({ statusCode: 200, body: 'Booking is not pending' });
  }

  const acceptedUsersInfo: { name: string; id: string }[] = [];

  switch (type) {
    case 'reaction_added':
      await UserEntity.put({
        messageId,
        userId,
        name: userName,
      });

      acceptedUsersInfo.push(
        ...acceptedUsers.map(({ userId: id, name }) => ({ id, name })),
        { id: userId, name: userName },
      );

      break;
    case 'reaction_removed':
      await UserEntity.delete({ [PK]: getUserPk({ messageId }), [SK]: userId });

      acceptedUsersInfo.push(
        ...acceptedUsers
          .map(({ userId: id, name }) => ({ id, name }))
          .filter(u => u.id !== userId),
      );
      break;
  }

  await updateMessage({
    messageId,
    channel: matchingBooking.channel,
    message: `Réservation prise pour : ${acceptedUsersInfo
      .map(({ name }) => name)
      .join(', ')}`,
  });

  return Promise.resolve({ statusCode: 200, body: 'ok' });
});

export const main = applySlackEventMiddleware(handler);
