export const loadBookingUser = (): {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
} => {
  const firstName = process.env.BOOKING_USER_FIRST_NAME;
  const lastName = process.env.BOOKING_USER_LAST_NAME;
  const phoneNumber = process.env.BOOKING_USER_PHONE_NUMBER;
  const email = process.env.BOOKING_USER_EMAIL;

  if (
    firstName === undefined ||
    lastName === undefined ||
    phoneNumber === undefined ||
    email === undefined
  ) {
    throw new Error('Missing booking user environment variables');
  }

  return {
    firstName,
    lastName,
    phoneNumber,
    email,
  };
};
