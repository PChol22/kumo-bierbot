import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
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
};

export class Book extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { restApi, slackSigningSecret, slackToken, table }: BookProps,
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
      },
    });

    table.grantReadWriteData(this.function);

    restApi.root
      .resourceForPath(bookContract.path)
      .addMethod(bookContract.method, new LambdaIntegration(this.function));
  }
}
