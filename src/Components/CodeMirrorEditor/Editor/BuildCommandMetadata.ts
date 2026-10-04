import { collectCommandAliases } from '@/Shared/Utils/CommandMnemonics';
import { buildInstructionRegistry } from '@/Wlan/InstructionRegistry';
import type { RuntimeCommand } from '@/Types/Registry';
import type { Translator } from '@/Types/Common';
import type { MacroCompletionItem } from '@/Types/Editor';

interface CommandMetadata {
  aliases: ReturnType<typeof collectCommandAliases>;
  description?: string;
}

const describeCommand = (command: RuntimeCommand, locale: string, t: Translator): string | undefined => {
  const { description } = command;
  if (!description) {
    return t('commandList.commandDescription', { name: command.name });
  }

  if (typeof description === 'string') {
    return description;
  }

  const localized =
    description[locale] || description[locale.split('-')[0]] || description.en || description.pl || Object.values(description)[0];
  return localized == null ? undefined : String(localized);
};

/** Resolves instruction aliases and descriptions for the active interface language. */
export const buildCommandMetadata = (
  commands: RuntimeCommand[],
  includeDirectives: boolean,
  locale: string,
  t: Translator
): CommandMetadata[] => {
  const entries = includeDirectives ? buildInstructionRegistry(commands).entries : commands;

  return entries.map((command) => ({
    aliases: collectCommandAliases(command, { locale }),
    description: describeCommand(command, locale, t),
  }));
};

/** Collects highlight words and one localized completion per distinct mnemonic. */
export const buildCommandCompletions = (metadata: CommandMetadata[]) => {
  const words = new Set<string>();
  const seenLabels = new Set<string>();
  const completions: MacroCompletionItem[] = [];

  for (const { aliases, description } of metadata) {
    for (const alias of aliases.all) {
      if (alias) {
        words.add(alias);
      }
    }

    const label = aliases.preferred[0] || aliases.canonical;
    const normalizedLabel = label.toUpperCase();
    if (!label || seenLabels.has(normalizedLabel)) {
      continue;
    }

    seenLabels.add(normalizedLabel);
    completions.push({ label, detail: description });
  }

  return { words: [...words], completions };
};
