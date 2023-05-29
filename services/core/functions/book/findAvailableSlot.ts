import { ZenChefAvailabilities } from 'libs/zenchef';

const BONUS_GUESTS = [2, 1, 0];

export const findAvailableSlot = ({
  availabilities,
  nbOfGuests,
  desiredSlots,
}: {
  availabilities: ZenChefAvailabilities;
  nbOfGuests: number;
  desiredSlots: string[];
}): { slot: string; capacity: number } | undefined => {
  const wantedSlots = desiredSlots.flatMap(slot =>
    BONUS_GUESTS.map(bonus => ({ slot, capacity: nbOfGuests + bonus })),
  );

  return wantedSlots.find(({ slot, capacity }) =>
    availabilities.some(
      ({ time, size }) => time === slot && size.includes(capacity),
    ),
  );
};
