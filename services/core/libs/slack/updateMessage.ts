import { webClient } from './webClient';

export const updateMessage = async ({
  messageId,
  channel,
  message,
}: {
  messageId: string;
  channel: string;
  message: string;
}): Promise<void> => {
  const response = await webClient.chat.update({
    channel,
    ts: messageId,
    text: message,
  });

  if (!response.ok) {
    throw new Error(response.error);
  }
};
