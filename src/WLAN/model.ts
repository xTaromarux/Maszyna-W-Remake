export type Token = {
  col: number;
  line: number;
  text: string;
  type: string;
};

export enum TokenType {
  IF = 'IF',
  IDENT = 'IDENT',
  COLON = 'COLON',
  NEWLINE = 'NEWLINE',
  SEMICOLON = 'SEMICOLON',
  THEN = 'THEN',
  ELSE = 'ELSE',
  NUMBER = 'NUMBER',
  AT = 'AT',
  COMMA = 'COMMA',
}
