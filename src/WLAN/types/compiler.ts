export interface Extras {
  xRegister?: boolean;
  yRegister?: boolean;
  dl?: boolean;
  jamlExtras?: boolean;
  busConnectors?: boolean;
}

export interface SignalsConfig {
  always: string[];
  xRegister: string[];
  yRegister: string[];
  dl: string[];
  jamlExtras: string[];
  busConnectors: string[];
}

export interface CompileExternalOptions {
  availableSignals: SignalsConfig;
  extras?: Extras;
}
