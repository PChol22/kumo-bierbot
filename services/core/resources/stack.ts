import { Stack, StackProps } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import { GetZenChefToken, SlackEvent } from 'functions/config';

interface CoreProps {
  stage: string;
  restaurantId: string;
  slackToken: string;
  slackChannelName: string;
  slackSigningSecret: string;
}

export class CoreStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & CoreProps) {
    super(scope, id, props);

    const { stage, restaurantId, slackSigningSecret } = props;

    const coreApi = new RestApi(this, 'CoreApi', {
      // the stage of the API is the same as the stage of the stack
      description: `Core API - ${stage}`,
      deployOptions: {
        stageName: stage,
      },
    });

    new GetZenChefToken(this, 'GetZenChefToken', {
      restApi: coreApi,
      restaurantId,
    });

    new SlackEvent(this, 'SlackEvent', {
      restApi: coreApi,
      slackSigningSecret,
    });
  }
}
