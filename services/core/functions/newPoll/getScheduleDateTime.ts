export const getScheduleTime = (): string => {
  const now =
    new Date()
      .toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
      .split(' ')[1] ?? '';

  const [hours = '', minutes = ''] = now.split(':');

  if (+hours < 16) {
    return '16:30:00';
  }

  if (+hours >= 23) {
    throw new Error(
      "Personne ne réserve un bar à cette heure-ci... (j'avais la flemme de coder ça)",
    );
  }

  return `${+hours + 1}:${minutes}:00`;
};
