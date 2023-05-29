import { webClient } from './webClient';

export const postMessage = async ({
  channelName,
  message,
}: {
  channelName: string;
  message: string;
}): Promise<{
  messageId: string | null;
  channel: string | null;
}> => {
  const response = await webClient.chat.postMessage({
    channel: `#${channelName}`,
    text: message,
  });
  if (!response.ok) {
    console.error(response.error);

    return { messageId: null, channel: null };
  }
  const currentMessageId = response.message?.ts ?? null;
  const currentChannelId = response.channel ?? null;

  return { messageId: currentMessageId, channel: currentChannelId };
};
