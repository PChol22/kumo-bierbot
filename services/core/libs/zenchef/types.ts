export type ZenChefToken = {
  token: string;
  timestamp: string;
};

export type ZenChefBooking = {
  date: string;
  nbGuests: number;
  time: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
};

export type ZenChefAvailabilities = {
  time: string;
  size: number[];
}[];
