import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@bierbot/serverless-configuration';

import { statsContract } from 'contracts';

type StatsProps = {
  restApi: RestApi;
  slackSigningSecret: string;
  slackToken: string;
  slackChannelName: string;
  table: Table;
};

export class Stats extends Construct {
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
    }: StatsProps,
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
      },
    });

    table.grantReadWriteData(this.function);

    restApi.root
      .resourceForPath(statsContract.path)
      .addMethod(statsContract.method, new LambdaIntegration(this.function));
  }
}
