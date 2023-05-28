import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@bierbot/serverless-configuration';

import { healthContract } from 'contracts/healthContract';

type HealthProps = { restApi: RestApi };

export class Health extends Construct {
  public healthFunction: NodejsFunction;

  constructor(scope: Construct, id: string, { restApi }: HealthProps) {
    super(scope, id);

    this.healthFunction = new NodejsFunction(this, 'Lambda', {
      entry: getCdkHandlerPath(__dirname),
      handler: 'main',
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      awsSdkConnectionReuse: true,
      bundling: sharedCdkEsbuildConfig,
    });

    restApi.root
      .resourceForPath(healthContract.path)
      .addMethod(
        healthContract.method,
        new LambdaIntegration(this.healthFunction),
      );
  }
}
