import { getCdkHandlerPath } from '@swarmion/serverless-helpers';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

import { sharedCdkEsbuildConfig } from '@bierbot/serverless-configuration';

import { getZenChefTokenContract } from 'contracts/getZenChefTokenContract';

type GetZenChefTokenProps = { restApi: RestApi; restaurantId: string };

export class GetZenChefToken extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { restApi, restaurantId }: GetZenChefTokenProps,
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
        RESTAURANT_ID: restaurantId,
      },
    });

    restApi.root
      .resourceForPath(getZenChefTokenContract.path)
      .addMethod(
        getZenChefTokenContract.method,
        new LambdaIntegration(this.function),
      );
  }
}
