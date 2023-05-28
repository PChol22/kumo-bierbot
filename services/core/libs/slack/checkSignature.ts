import { createHmac } from 'crypto';

export const checkSignature = (
  inSignature: string,
  ts: string,
  body: unknown,
  secret: string,
): boolean => {
  const rawBody = JSON.stringify(body);

  const signature = createHmac('SHA256', secret)
    .update(`v0:${ts}:${rawBody}`)
    .digest('hex');

  return inSignature === `v0=${signature}`;
};
