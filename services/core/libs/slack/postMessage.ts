import { webClient } from './webClient';

export const postMessage = async ({
  channelName,
  message,
}: {
  channelName: string;
  message: string;
}): Promise<{
  messageId: string;
  channel: string;
}> => {
  const response = await webClient.chat.postMessage({
    channel: `#${channelName}`,
    text: message,
  });
  if (
    !response.ok ||
    response.message?.ts === undefined ||
    response.channel === undefined
  ) {
    throw new Error(response.error);
  }

  return { messageId: response.message.ts, channel: response.channel };
};
