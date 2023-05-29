import { Entity, EntityItem } from 'dynamodb-toolbox';

import { PK, SK } from 'libs/constants';

import { coreTable } from './table';

export const ENTITY_NAME = 'Booking';
export const BOOKING_PK = ENTITY_NAME;

export const BookingStatus = {
  PENDING: 'PENDING',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BookingEntity = new Entity({
  name: ENTITY_NAME,
  attributes: {
    [PK]: { partitionKey: true, type: 'string', default: BOOKING_PK },
    [SK]: {
      sortKey: true,
      type: 'string',
      default: ({ messageId }: { messageId: string }) => messageId,
    },
    status: { type: 'string', required: true },
    messageId: { type: 'string', required: true },
  },
  table: coreTable,
});

export type BookingEntityType = Omit<
  EntityItem<typeof BookingEntity>,
  'status'
> & {
  status: BookingStatus;
};
