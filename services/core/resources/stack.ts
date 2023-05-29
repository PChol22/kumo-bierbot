import { Stack, StackProps } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

import { Book, NewPoll, SlackEvent } from 'functions/config';
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

    new NewPoll(this, 'NewPoll', {
      restApi: coreApi,
      slackSigningSecret,
      slackChannelName,
      slackToken,
      table,
    });

    new Book(this, 'Book', {
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
  }
}
