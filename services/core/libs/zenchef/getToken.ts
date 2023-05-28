import fetch from 'node-fetch';

import { ZenChefToken } from './types';

const TOKEN_REGEX = /"authToken":"[0-9a-z]*"/;
const TIMESTAMP_REGEX = /"timestamp":[0-9]*/;

export const getZenChefToken = async ({
  restaurantId,
}: {
  restaurantId: string;
}): Promise<ZenChefToken> => {
  const response = await fetch(
    `https://bookings.zenchef.com/results?rid=${restaurantId}`,
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,fr;q=0.8',
        'sec-ch-ua':
          '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'upgrade-insecure-requests': '1',
      },
      referrer: 'http://www.cafebiergit.com/',
      body: null,
      method: 'GET',
      //@ts-ignore - credentials and cors is not defined in node-fetch
      mode: 'cors',
      credentials: 'include',
    },
  );

  const page = await response.text();

  const tokenMatch = page.match(TOKEN_REGEX);
  const timestampMatch = page.match(TIMESTAMP_REGEX);

  if (!tokenMatch || !timestampMatch) {
    throw new Error('Unable to get token');
  }

  const token = tokenMatch[0].split('"')[3];
  const timestamp = timestampMatch[0].split(':')[1];

  if (token === undefined || timestamp === undefined) {
    throw new Error('Unable to get token');
  }

  return {
    token,
    timestamp,
  };
};
