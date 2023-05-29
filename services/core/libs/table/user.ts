import { Entity, EntityItem } from 'dynamodb-toolbox';

import { PK, SK } from 'libs/constants';

import { coreTable } from './table';

export const USER_ENTITY_NAME = 'User';
export const getUserPk = ({ messageId }: { messageId: string }): string =>
  `${USER_ENTITY_NAME}#${messageId}`;

export const UserEntity = new Entity({
  name: USER_ENTITY_NAME,
  attributes: {
    [PK]: {
      partitionKey: true,
      type: 'string',
      default: getUserPk,
      hidden: true,
    },
    [SK]: {
      sortKey: true,
      type: 'string',
      default: ({ userId }: { userId: string }) => userId,
      hidden: true,
    },
    userId: { type: 'string', required: true },
    messageId: { type: 'string', required: true },
    name: { type: 'string', required: true },
  },
  table: coreTable,
});

export type UserEntityType = EntityItem<typeof UserEntity>;
