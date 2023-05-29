import { WebClient } from '@slack/web-api';

export const webClient = new WebClient(process.env.SLACK_TOKEN);
