export const commandList = [
  {
    name: 'STP',
    mnemonics: { en: ['STOP', 'HALT'] },
    args: 0,
    description: { pl: 'zakończenie programu', en: 'program end' },
    lines: 'czyt wys wei il;\nstop;',
  },

  {
    name: 'DOD',
    mnemonics: { en: 'ADD' },
    args: 1,
    description: { pl: '(Ak) + ((Ad)) -> Ak', en: '(Ak) + ((Ad)) -> Ak' },
    lines: 'czyt wys wei il;\nwyad wea;\nczyt wys weja dod weak wyl wea;',
  },

  {
    name: 'ODE',
    mnemonics: { en: 'SUB' },
    args: 1,
    description: { pl: '(Ak) - ((Ad)) -> Ak', en: '(Ak) - ((Ad)) -> Ak' },
    lines: 'czyt wys wei il;\nwyad wea;\nczyt wys weja ode weak wyl wea;',
  },

  {
    name: 'POB',
    mnemonics: { en: 'LOAD' },
    args: 1,
    description: { pl: '((Ad)) -> Ak', en: '((Ad)) -> Ak' },
    lines: 'czyt wys wei il;\nwyad wea;\nczyt wys weja przep weak wyl wea;',
  },

  {
    name: 'LAD',
    mnemonics: { en: 'STORE' },
    args: 1,
    description: { pl: '(Ak) -> (Ad)', en: '(Ak) -> (Ad)' },
    lines: 'czyt wys wei il;\nwyad wea wyak wes;\npisz wyl wea;',
  },

  {
    name: 'SOB',
    mnemonics: { en: 'JMP' },
    args: 1,
    description: { pl: 'skok bezwarunkowy', en: 'unconditional jump' },
    lines: 'czyt wys wei il;\nwyad wea wel;',
  },

  {
    name: 'SOM',
    mnemonics: { en: 'JNEG' },
    args: 1,
    description: { pl: 'skok gdy (AK) < 0', en: 'jump when (AK) < 0' },
    lines: `czyt wys wei il;\nIF N THEN @negative ELSE @positive;\n@negative wyad wea wel END;\n@positive wyl wea;`,
  },

  {
    name: 'SOZ',
    mnemonics: { en: 'JZERO' },
    args: 1,
    description: { pl: 'skok gdy (AK) = 0', en: 'jump when (AK) = 0' },
    lines: `czyt wys wei il;\nIF Z THEN @zero ELSE @notzero;\n@zero wyad wea wel END;\n@notzero wyl wea;`,
  },

  {
    name: 'DNS',
    mnemonics: { en: 'DNS' },
    args: 0,
    description: { pl: 'rozkaz dns', en: 'DNS instruction' },
    lines: `czyt wys wei il;\ndws;\nwyws wea wyak wes;\npisz wyl wea;`,
  },

  {
    name: 'PWR',
    mnemonics: { en: 'PWR' },
    args: 0,
    description: { pl: 'rozkaz pwr', en: 'PWR instruction' },
    lines: `czyt wys wei il;\nwyws wea;\nczyt wys sa wel iws;`,
  },

  {
    name: 'PZS',
    mnemonics: { en: 'PZS' },
    args: 0,
    description: { pl: 'rozkaz pzs', en: 'PZS instruction' },
    lines: `czyt wys wei il;\nwyws wea;\nczyt wys weja przep weak iws wyl wea;`,
  },

  {
    name: 'SDP',
    mnemonics: { en: 'SDP' },
    args: 1,
    description: { pl: 'rozkaz sdp', en: 'SDP instruction' },
    lines: `czyt wys wei il;\ndws;\nwyws wea wyls wes;\npisz wyad wel wea;`,
  },

  {
    name: 'DZI',
    mnemonics: { en: 'DIV' },
    args: 1,
    description: { pl: 'ROZKAZ DZI', en: 'DZI instruction' },
    lines: `czyt wys wei il;\nwyad wea;\nczyt wys weja dziel weak wyl wea;`,
  },

  {
    name: 'MNO',
    mnemonics: { en: 'MUL' },
    args: 1,
    description: { pl: 'ROZKAZ MNO', en: 'MNO instruction' },
    lines: `czyt wys wei il;\nwyad wea;\nczyt wys weja mno weak wyl wea;`,
  },

  {
    name: 'WPR',
    mnemonics: { en: 'IN' },
    args: 1,
    description: { pl: 'wczytaj znak z urządzenia zewnętrznego', en: 'read a character from an external device' },
    lines: `czyt wys wei il;\nwyak weja ode weak start;\n@wait wyg weja ode weak IF Z THEN @done ELSE @wait;\n@done wyrb weja przep weak wyl wea;`,
  },

  {
    name: 'WYP',
    mnemonics: { en: 'OUT' },
    args: 1,
    description: { pl: 'wyprowadź znak na urządzenie zewnętrzne', en: 'output a character to an external device' },
    lines: `czyt wys wei il;\nwyak weja werb start;\nwyak wes weja ode weak;\n@wait wyg weja ode weak IF Z THEN @done ELSE @wait;\n@done wys weja przep weak wyl wea;`,
  },

  {
    name: 'MAS',
    mnemonics: { en: 'MAS' },
    args: 1,
    description: {
      pl: 'Rozkaz maskowania - ustaw maskę RM = argument instrukcji (adresowanie bezpośrednie)',
      en: 'Masking instruction - set RM mask = instruction argument (direct addressing)',
    },
    lines: `czyt wys wei il;\nwyad sa werm;\nwyl wea;`,
  },

  {
    name: 'MSK',
    mnemonics: { en: 'MSK' },
    args: 1,
    description: { pl: 'Rozkaz maskowania adresowanie bezpośrednie', en: 'Masking instruction (direct addressing)' },
    lines: `czyt wys wei il;\nwyad wea;\nczyt wys werm;\nwyl wea;`,
  },

  {
    name: 'CZM',
    mnemonics: { en: 'CZM' },
    args: 1,
    description: { pl: 'Wyczyść bit w rejestrze maski (odblokuj przerwanie)', en: 'Clear bit in mask register (unblock interrupt)' },
    lines: `czyt wys wei il;\nwyad czrm;\nwyl wea;`,
  },

  {
    name: 'WPR2',
    mnemonics: { en: 'WPR2' },
    args: 1,
    description: {
      pl: 'Wczytanie znaku z urządzenia zewnętrznego o numerze podanym jako argument',
      en: 'Read a character from an external device with number given as argument',
    },
    lines: `czyt wys wei il;\nstart wyak weja ode weak;\n@wait wyg weja ode weak IF Z THEN @done ELSE @wait;\n@done wyrb weja przep weak wyl wea;`,
  },

  {
    name: 'WYP2',
    mnemonics: { en: 'WYP2' },
    args: 1,
    description: {
      pl: 'Wypisanie znaku znajdującego się w akumulatorze na urządzenie zewnętrzne o numerze podanym jako argument',
      en: 'Output the character in the accumulator to an external device with number given as argument',
    },
    lines: `czyt wys wei il;\nwyak weja ode weak wes werb start;\n@wait wyg weja ode weak IF Z THEN @done ELSE @wait;\n@done wys weja przep weak wyl wea;`,
  },
];
