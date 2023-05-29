// import fetch from 'node-fetch';

import { ZenChefBooking, ZenChefToken } from './types';

export const bookTable = async ({
  restaurantId,
  zenChefToken: { token, timestamp },
  booking: { date, nbGuests, time, firstName, lastName, phoneNumber, email },
}: {
  restaurantId: string;
  zenChefToken: ZenChefToken;
  booking: ZenChefBooking;
}): Promise<void> => {
  // await fetch(
  //   `https://bookings-middleware.zenchef.com/booking?restaurantId=${restaurantId}`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       authority: 'bookings-middleware.zenchef.com',
  //       accept: 'application/json, text/plain, */*',
  //       'accept-language': 'en-US,en;q=0.9,fr;q=0.8',
  //       'auth-token': token,
  //       'content-type': 'application/json',
  //       origin: 'https://bookings.zenchef.com',
  //       referer: 'https://bookings.zenchef.com/',
  //       'sec-ch-ua':
  //         '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
  //       'sec-ch-ua-mobile': '?0',
  //       'sec-ch-ua-platform': '"Linux"',
  //       'sec-fetch-dest': 'empty',
  //       'sec-fetch-mode': 'cors',
  //       'sec-fetch-site': 'same-site',
  //       timestamp: `${timestamp}`,
  //       'user-agent':
  //         'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
  //     },
  //     body: JSON.stringify({
  //       day: date,
  //       nb_guests: nbGuests,
  //       time: time,
  //       lang: 'fr',
  //       firstname: firstName,
  //       lastname: lastName,
  //       civility: 'mr',
  //       country: 'fr',
  //       phone_number: phoneNumber,
  //       email: email,
  //       comment: '',
  //       custom_field: {},
  //       customersheet: {
  //         firstname: firstName,
  //         lastname: lastName,
  //         civility: 'mr',
  //         phone: phoneNumber,
  //         email: email,
  //         optins: [
  //           {
  //             type: 'review_mail',
  //             value: 1,
  //           },
  //           {
  //             type: 'review_sms',
  //             value: 1,
  //           },
  //         ],
  //         country: 'fr',
  //         lang: 'fr',
  //       },
  //       offers: [],
  //       partner_id: '1001',
  //       reservation_type: 'reservation',
  //       type: 'web',
  //     }),
  //   },
  // );

  console.log({
    restaurantId,
    token,
    timestamp,
    date,
    nbGuests,
    time,
    firstName,
    lastName,
    phoneNumber,
    email,
  });

  return Promise.resolve();
};
