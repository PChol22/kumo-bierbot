import { Entity, EntityItem } from 'dynamodb-toolbox';

import { PK, SK } from 'libs/constants';

import { coreTable } from './table';

export const BOOKING_ENTITY_NAME = 'Booking';
export const BOOKING_PK = BOOKING_ENTITY_NAME;

export const BookingStatus = {
  PENDING: 'PENDING',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BookingEntity = new Entity({
  name: BOOKING_ENTITY_NAME,
  attributes: {
    [PK]: {
      partitionKey: true,
      type: 'string',
      default: BOOKING_PK,
      hidden: true,
    },
    [SK]: {
      sortKey: true,
      type: 'string',
      default: ({ messageId }: { messageId: string }) => messageId,
      hidden: true,
    },
    status: { type: 'string', required: true },
    messageId: { type: 'string', required: true },
    channel: { type: 'string', required: true },
    scheduleTime: { type: 'string', required: true },
  },
  table: coreTable,
});

export type BookingEntityType = Omit<
  EntityItem<typeof BookingEntity>,
  'status'
> & {
  status: BookingStatus;
};
