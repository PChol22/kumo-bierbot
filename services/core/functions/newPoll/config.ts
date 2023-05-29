import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
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
};

export class NewPoll extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { restApi, slackSigningSecret, slackToken, slackChannelName }: NewPollProps,
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
      },
    });

    restApi.root
      .resourceForPath(newPollContract.path)
      .addMethod(newPollContract.method, new LambdaIntegration(this.function));
  }
}
