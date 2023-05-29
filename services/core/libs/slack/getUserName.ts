import { webClient } from './webClient';

export const getUserName = async (userId: string): Promise<string> => {
  const { user } = await webClient.users.info({
    user: userId,
  });

  if (user?.real_name === undefined) {
    throw new Error('User not found');
  }

  return user.real_name;
};
