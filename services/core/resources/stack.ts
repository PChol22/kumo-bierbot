import { Stack, StackProps } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { ApiBook, NewPoll, ScheduledBook, SlackEvent } from 'functions/config';
import { PK, SK } from 'libs/constants';

interface CoreProps {
  stage: string;
  restaurantId: string;
  slackToken: string;
  slackChannelName: string;
  slackSigningSecret: string;
  bookingUserFirstName: string;
  bookingUserLastName: string;
  bookingUserPhoneNumber: string;
  bookingUserEmail: string;
}

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & CoreProps) {
    super(scope, id, props);

    const {
      stage,
      restaurantId,
      slackSigningSecret,
      slackChannelName,
      slackToken,
      bookingUserFirstName,
      bookingUserLastName,
      bookingUserPhoneNumber,
      bookingUserEmail,
    } = props;

    const coreApi = new RestApi(this, 'CoreApi', {
      // the stage of the API is the same as the stage of the stack
      description: `Core API - ${stage}`,
      deployOptions: {
        stageName: stage,
      },
    });

    const table = new Table(this, 'Bookings', {
      partitionKey: {
        name: PK,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: SK,
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    new SlackEvent(this, 'SlackEvent', {
      restApi: coreApi,
      slackSigningSecret,
      slackToken,
      table,
    });

    new ApiBook(this, 'ApiBook', {
      restApi: coreApi,
      slackSigningSecret,
      slackToken,
      table,
      restaurantId,
      bookingUserEmail,
      bookingUserFirstName,
      bookingUserLastName,
      bookingUserPhoneNumber,
    });

    const scheduledBook = new ScheduledBook(this, 'ScheduledBook', {
      slackToken,
      table,
      restaurantId,
      bookingUserEmail,
      bookingUserFirstName,
      bookingUserLastName,
      bookingUserPhoneNumber,
    });

    const invokeScheduledBookRole = new Role(this, 'InvokeScheduledBookRole', {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
    });

    invokeScheduledBookRole.addToPolicy(
      new PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: [scheduledBook.function.functionArn],
        effect: Effect.ALLOW,
      }),
    );

    new NewPoll(this, 'NewPoll', {
      restApi: coreApi,
      slackSigningSecret,
      slackChannelName,
      slackToken,
      table,
      scheduledBookArn: scheduledBook.function.functionArn,
      scheduledBookRoleArn: invokeScheduledBookRole.roleArn,
    });
  }
}
