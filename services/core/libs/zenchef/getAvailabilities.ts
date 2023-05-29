import fetch from 'node-fetch';

import { ZenChefAvailabilities } from './types';

export const getAvailabilities = async ({
  restaurantId,
  date,
}: {
  restaurantId: string;
  date: string;
}): Promise<ZenChefAvailabilities> => {
  const response = await fetch(
    `https://bookings-middleware.zenchef.com/getAvailabilities?restaurantId=${restaurantId}&date_begin=${date}&date_end=${date}`,
    {
      method: 'GET',
    },
  );

  const data = (await response.json()) as [
    {
      date: string;
      shifts: [
        {
          shift_slots: [
            {
              name: string;
              possible_guests: number[];
            },
          ];
        },
      ];
    },
  ];

  return data[0].shifts.flatMap(({ shift_slots }) =>
    shift_slots.map(({ name, possible_guests }) => ({
      time: name,
      size: possible_guests,
    })),
  );
};
