import { MIN_CAPACITY } from 'libs/constants';
import { formatBookingMessage, formatNoSlotMessage } from 'libs/formatMessage';
import { updateMessage } from 'libs/slack';
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

export const sharedHandler =
  (skipSmallBookings: boolean) =>
  async (): Promise<{
    statusCode: number;
    body: unknown;
  }> => {
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

    if (skipSmallBookings && acceptedUsers.length < MIN_CAPACITY) {
      return {
        statusCode: 200,
        body: undefined,
      };
    }

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
          message: formatNoSlotMessage({
            desiredSlots: DESIRED_SLOTS,
            nbOfGuests: acceptedUsers.length,
          }),
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
        message: formatBookingMessage({
          guests: acceptedUsers.map(({ name }) => name),
          time: availableSlot.slot,
          capacity: availableSlot.capacity,
        }),
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
  };
