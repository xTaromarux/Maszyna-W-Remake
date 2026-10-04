import type { Person } from '@/Types/Components';

export const DEFAULT_CREATORS: Person[] = [
  { name: 'Szymon Woźnica', linkedin: 'https://pl.linkedin.com/in/szymon-wo%C5%BAnica-b46b7b201' },
  { name: 'Maja Kucab' },
  { name: 'Kacper Sikorski', linkedin: 'https://www.linkedin.com/in/kacper-sikorski-049b4a334/', github: 'https://github.com/Sikor915' },
  { name: 'Sławomir Put', linkedin: 'https://www.linkedin.com/in/slawomir-put/', github: 'https://github.com/xTaromarux' },
  { name: 'Paweł Linek', linkedin: 'https://www.linkedin.com/in/paweloslinek/', github: 'https://github.com/pawelos231' },
  { name: 'Bartek Faruga', linkedin: 'https://www.linkedin.com/in/bartosz-faruga/', github: 'https://github.com/MrRooby' },
  ...['Marcin Ryt', 'Oskar Forreiter', 'Michał Kostrzewski', 'Sebastian Legierski', 'Paweł Janus'].map((name) => ({ name })),
];
export const DEFAULT_CAREGIVERS: Person[] = [
  { baseName: 'Robert Tutajewicz', titles: ['dr', 'inz'] },
  { baseName: 'Krzysztof Simiński', titles: ['drHab', 'inz'] },
  { baseName: 'Tomasz Rudnicki', titles: ['dr', 'inz'] },
];
