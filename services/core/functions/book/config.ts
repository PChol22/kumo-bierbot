import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { Duration } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@bierbot/serverless-configuration';

import { bookContract } from 'contracts';

type BookProps = {
  restApi: RestApi;
  slackSigningSecret: string;
  slackToken: string;
  table: Table;
  restaurantId: string;
  bookingUserFirstName: string;
  bookingUserLastName: string;
  bookingUserPhoneNumber: string;
  bookingUserEmail: string;
};

export class Book extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    {
      restApi,
      slackSigningSecret,
      slackToken,
      table,
      restaurantId,
      bookingUserFirstName,
      bookingUserLastName,
      bookingUserPhoneNumber,
      bookingUserEmail,
    }: BookProps,
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
        SLACK_SIGNING_SECRET: slackSigningSecret,
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

    restApi.root
      .resourceForPath(bookContract.path)
      .addMethod(bookContract.method, new LambdaIntegration(this.function));
  }
}
