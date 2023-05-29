export const slackHeaders = {
  type: 'object',
  properties: {
    'X-Slack-Signature': { type: 'string' },
    'X-Slack-Request-Timestamp': { type: 'string' },
  },
  required: ['X-Slack-Signature', 'X-Slack-Request-Timestamp'],
} as const;
