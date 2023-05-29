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
import { bookTable, getAvailabilities, getZenChefToken } from 'libs/zenchef';

import { findAvailableSlot } from './findAvailableSlot';
import { loadBookingUser } from './loadBookingUser';

const DESIRED_SLOTS = ['18:30', '19:00', '18:00'];

const ajv = new Ajv();

const handler = getHandler(bookContract, { ajv })(async () => {
  const restaurantId = process.env.RESTAURANT_ID;

  if (restaurantId === undefined) {
    throw new Error('Missing environment variable RESTAURANT_ID');
  }

  const bookingUser = loadBookingUser();

  const date = new Date().toISOString().split('T')[0] ?? '';

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

  const [{ Items: acceptedUsers = [] }, availabilities] = await Promise.all([
    BookingEntity.query<UserEntityType>(getUserPk({ messageId })),
    getAvailabilities({ restaurantId, date }),
  ]);

  const availableSlot = findAvailableSlot({
    availabilities,
    nbOfGuests: acceptedUsers.length,
    desiredSlots: DESIRED_SLOTS,
  });

  if (availableSlot === undefined) {
    await Promise.all([
      updateMessage({
        channel,
        messageId,
        message: `Pas de réservation trouvée à ${DESIRED_SLOTS.join(
          ', ',
        )} pour ${acceptedUsers.length} personnes 😢`,
      }),
      BookingEntity.update({
        messageId,
        status: BookingStatus.CANCELLED,
      }),
    ]);

    return {
      statusCode: 200,
      body: undefined,
    };
  }

  const zenChefToken = await getZenChefToken({ restaurantId });

  await bookTable({
    restaurantId,
    zenChefToken,
    booking: {
      date,
      time: availableSlot.slot,
      nbGuests: availableSlot.capacity,
      ...bookingUser,
    },
  });

  await Promise.all([
    updateMessage({
      channel,
      messageId,
      message: `Le biergit est réservé pour ${
        availableSlot.capacity
      } personnes à ${availableSlot.slot}! ${acceptedUsers
        .map(({ name }) => name)
        .join(', ')}`,
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
