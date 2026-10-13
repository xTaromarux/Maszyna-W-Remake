import type { Translator } from '@/Shared/Types/Common';
import type { Person } from '@/Components/Settings/About/Types';

export const localizePeople = (people: Person[], translate: Translator): Person[] =>
  people.map((person) => {
    if (!person.baseName || !Array.isArray(person.titles)) {
      return person;
    }

    const titles = person.titles
      .map((title) => translate(`titles.${title}`))
      .filter(Boolean)
      .join(' ');
    return { ...person, name: `${titles} ${person.baseName}`.trim() };
  });
