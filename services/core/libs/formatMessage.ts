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
