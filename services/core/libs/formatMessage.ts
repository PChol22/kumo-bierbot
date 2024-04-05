import { MIN_CAPACITY } from './constants';

export const formatPollMessage = ({
  guests,
  scheduleTime,
}: {
  guests: string[];
  scheduleTime: string;
}): string => {
  const header = "*Réservation pour le Biergit aujourd'hui à 18h30 !*";
  const footer = `_Si ${MIN_CAPACITY} personnes acceptent, la réservation partira à ${scheduleTime}_
  
Ajoute un react 🍻 pour t'inscrire !`;

  if (guests.length === 0) {
    return `${header}

${footer}`;
  }

  return `${header}
  
${guests.length} personnes ont accepté:
${guests.map(guest => `- ${guest}`).join('\n')}

${footer}`;
};

export const formatBookingMessage = ({
  guests,
  time,
  capacity,
}: {
  guests: string[];
  time: string;
  capacity: number;
}): string => `*Le Biergit a été réservé aujourd'hui à ${time} pour ${capacity} personnes !*

${guests.length} personnes ont accepté:
${guests.map(guest => `- ${guest}`).join('\n')}

J'ai réservé ${capacity - guests.length} places en bonus !`;

export const formatNoSlotMessage = ({
  desiredSlots,
  nbOfGuests,
}: {
  desiredSlots: string[];
  nbOfGuests: number;
}): string =>
  `Pas de réservation trouvée à ${desiredSlots.join(
    ', ',
  )} pour ${nbOfGuests} personnes 😢`;

export const formatStatsMessage = ({
  rankedTheodoers,
}: {
  rankedTheodoers: { name: string; numberOfComings: number }[];
}): string => {
  const header = '*🙀 Biergit Statistics 🙀*';
  const footer = `_:peepobeer: TOP10 :peepobeer:_`;

  const ranking = rankedTheodoers.map(({ name, numberOfComings }, index) => {
    let emoji = '';
    if (index === 0) {
      emoji = ':first_place_medal: ';
    } else if (index === 1) {
      emoji = ':second_place_medal: ';
    } else if (index === 2) {
      emoji = ':third_place_medal: ';
    }

    return `${emoji}${name}, ${numberOfComings} fois`;
  });

  return `${header} 

${footer}

${ranking.join('\n')}`;
};
