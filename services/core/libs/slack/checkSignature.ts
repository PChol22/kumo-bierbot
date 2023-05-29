import { createHmac } from 'crypto';

export const checkSignature = (
  inSignature: string,
  ts: string,
  body: string,
  secret: string,
): boolean => {
  const signature = createHmac('SHA256', secret)
    .update(`v0:${ts}:${body}`)
    .digest('hex');

  return inSignature === `v0=${signature}`;
};
