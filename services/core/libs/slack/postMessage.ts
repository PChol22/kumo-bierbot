import { webClient } from './webClient';

export const postMessage = async ({
  channelName,
  message,
}: {
  channelName: string;
  message: string;
}): Promise<{
  messageId: string;
}> => {
  const response = await webClient.chat.postMessage({
    channel: `#${channelName}`,
    text: message,
  });
  if (!response.ok || response.message?.ts === undefined) {
    throw new Error(response.error);
  }

  return { messageId: response.message.ts };
};
