import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { Duration } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@bierbot/serverless-configuration';

type ScheduledBookProps = {
  slackToken: string;
  table: Table;
  restaurantId: string;
  bookingUserFirstName: string;
  bookingUserLastName: string;
  bookingUserPhoneNumber: string;
  bookingUserEmail: string;
};

export class ScheduledBook extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    {
      slackToken,
      table,
      restaurantId,
      bookingUserFirstName,
      bookingUserLastName,
      bookingUserPhoneNumber,
      bookingUserEmail,
    }: ScheduledBookProps,
  ) {
    super(scope, id);

    this.function = new NodejsFunction(this, 'Lambda', {
      entry: getCdkHandlerPath(__dirname),
      handler: 'main',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: true,
      bundling: sharedCdkEsbuildConfig,
      environment: {
        SLACK_TOKEN: slackToken,
        TABLE_NAME: table.tableName,
        RESTAURANT_ID: restaurantId,
        BOOKING_USER_FIRST_NAME: bookingUserFirstName,
        BOOKING_USER_LAST_NAME: bookingUserLastName,
        BOOKING_USER_PHONE_NUMBER: bookingUserPhoneNumber,
        BOOKING_USER_EMAIL: bookingUserEmail,
      },
      timeout: Duration.seconds(15),
    });

    table.grantReadWriteData(this.function);
  }
}
