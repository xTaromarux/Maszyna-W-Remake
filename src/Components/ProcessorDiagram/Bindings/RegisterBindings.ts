import type { NumberFormat } from '@/Shared/Types/Numbers';
import type { ProcessorDiagramProps } from '@/Components/ProcessorDiagram/Types';
import type { RegisterFormatField } from '@/Machine/Types/Machine';

/** Connects each diagram register to its explicit value callback and number format. */
export const createRegisterBindings = (props: ProcessorDiagramProps) => {
  const formatBinding = (field: RegisterFormatField) => ({
    signals: props.signals,
    formatNumber: props.formatNumber,
    numberFormat: props.registerFormats[field],
    onUpdateNumberFormat: (value: NumberFormat) => props.onUpdateNumberFormat?.({ field, value }),
    onClickItem: props.onClickItem,
  });

  return {
    L: { ...formatBinding('L'), onUpdateProgramCounter: props.onUpdateProgramCounter },
    I: { ...formatBinding('I'), onUpdateI: props.onUpdateI },
    X: { ...formatBinding('X'), onUpdateX: props.onUpdateX },
    Y: { ...formatBinding('Y'), onUpdateY: props.onUpdateY },
    WS: { ...formatBinding('WS'), onUpdateWS: props.onUpdateWS },
    RB: { ...formatBinding('RB'), onUpdateRB: props.onUpdateRB },
    G: { ...formatBinding('G'), onUpdateG: props.onUpdateG },
    RZ: { ...formatBinding('RZ'), onUpdateRZ: props.onUpdateRZ },
    RP: { ...formatBinding('RP'), onUpdateRP: props.onUpdateRP },
    RM: { ...formatBinding('RM'), onUpdateRM: props.onUpdateRM },
    AP: { ...formatBinding('AP'), onUpdateAP: props.onUpdateAP },
  };
};

export type RegisterBindings = ReturnType<typeof createRegisterBindings>;
