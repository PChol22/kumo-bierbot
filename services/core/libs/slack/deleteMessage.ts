import { webClient } from './webClient';

export const deleteMessage = async ({
  channel,
  messageId,
}: {
  channel: string;
  messageId: string;
}): Promise<void> => {
  const response = await webClient.chat.delete({
    channel,
    ts: messageId,
  });

  if (!response.ok) {
    throw new Error(response.error);
  }
};
