import {
  CreateScheduleCommand,
  FlexibleTimeWindowMode,
  SchedulerClient,
} from '@aws-sdk/client-scheduler';
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

import { getScheduleTime } from './getScheduleDateTime';

const schedulerClient = new SchedulerClient({});

const ajv = new Ajv();

const handler = getHandler(newPollContract, { ajv })(async () => {
  const channelName = process.env.SLACK_CHANNEL_NAME;
  const scheduledBookArn = process.env.SCHEDULED_BOOK_ARN;
  const scheduledBookRoleArn = process.env.SCHEDULED_BOOK_ROLE_ARN;

  if (
    channelName === undefined ||
    scheduledBookArn === undefined ||
    scheduledBookRoleArn === undefined
  ) {
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

  const scheduleDate = new Date().toISOString().split('T')[0] ?? '';
  const scheduleTime = getScheduleTime();

  const { messageId, channel } = await postMessage({
    channelName,
    message: formatPollMessage({ guests: [], scheduleTime }),
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
      scheduleTime,
    }),
    ...onGoingBookings.map(({ messageId: mId, channel: messageChannel }) =>
      deleteMessage({ channel: messageChannel, messageId: mId }),
    ),
    schedulerClient.send(
      new CreateScheduleCommand({
        Name: messageId,
        ScheduleExpressionTimezone: 'Europe/Paris',
        Target: {
          Arn: scheduledBookArn,
          RoleArn: scheduledBookRoleArn,
        },
        ScheduleExpression: `at(${scheduleDate}T${scheduleTime})`,
        FlexibleTimeWindow: {
          Mode: FlexibleTimeWindowMode.OFF,
        },
      }),
    ),
  ]);

  return {
    statusCode: 200,
    body: undefined,
  };
});

export const main = applySlashCommandMiddleware(handler);
