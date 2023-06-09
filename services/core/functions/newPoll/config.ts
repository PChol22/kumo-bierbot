import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@bierbot/serverless-configuration';

import { newPollContract } from 'contracts';

type NewPollProps = {
  restApi: RestApi;
  slackSigningSecret: string;
  slackToken: string;
  slackChannelName: string;
  table: Table;
  scheduledBookArn: string;
  scheduledBookRoleArn: string;
};

export class NewPoll extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    {
      restApi,
      slackSigningSecret,
      slackToken,
      slackChannelName,
      table,
      scheduledBookArn,
      scheduledBookRoleArn,
    }: NewPollProps,
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
        SLACK_CHANNEL_NAME: slackChannelName,
        TABLE_NAME: table.tableName,
        SCHEDULED_BOOK_ARN: scheduledBookArn,
        SCHEDULED_BOOK_ROLE_ARN: scheduledBookRoleArn,
      },
    });

    table.grantReadWriteData(this.function);

    this.function.addToRolePolicy(
      new PolicyStatement({
        actions: ['scheduler:CreateSchedule'],
        resources: ['*'],
        effect: Effect.ALLOW,
      }),
    );

    this.function.addToRolePolicy(
      new PolicyStatement({
        actions: ['iam:PassRole'],
        resources: [scheduledBookRoleArn],
        effect: Effect.ALLOW,
      }),
    );

    restApi.root
      .resourceForPath(newPollContract.path)
      .addMethod(newPollContract.method, new LambdaIntegration(this.function));
  }
}
