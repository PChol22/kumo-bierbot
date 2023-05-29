import { WebClient } from '@slack/web-api';

const slackToken = process.env.SLACK_TOKEN;

if (slackToken === undefined) {
  throw new Error('Missing SLACK_TOKEN environment variable');
}

export const webClient = new WebClient(slackToken);
