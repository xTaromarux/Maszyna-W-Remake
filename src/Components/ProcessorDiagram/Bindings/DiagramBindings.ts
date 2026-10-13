import type { NumberFormat } from '@/Shared/Types/Numbers';
import type { AluSectionProps, ProcessorDiagramProps } from '../Types';
import type { MemorySectionProps } from '../MemorySection/Types';

type AluBindings = AluSectionProps & {
  jamlFormat: NumberFormat | undefined;
  onUpdateJamlFormat: (value: NumberFormat) => void;
};

/** Connects ALU values and each explicit register format to their diagram callbacks. */
export const createAluBindings = (props: ProcessorDiagramProps): AluBindings => {
  const { wordBits = 8, decSigned = false } = props;

  return {
    signals: props.signals,
    extras: props.extras,
    ACC: props.ACC,
    JAML: props.JAML,
    WS: props.WS,
    decSigned,
    wordBits,
    formatNumber: props.formatNumber,
    numberFormat: props.registerFormats.WS,
    accFormat: props.registerFormats.ACC,
    jamlFormat: props.registerFormats.JAML,
    onUpdateAccFormat: (value: NumberFormat) => props.onUpdateNumberFormat?.({ field: 'ACC', value }),
    onUpdateNumberFormat: (value: NumberFormat) => props.onUpdateNumberFormat?.({ field: 'WS', value }),
    onUpdateJamlFormat: (value: NumberFormat) => props.onUpdateNumberFormat?.({ field: 'JAML', value }),
    onUpdateACC: props.onUpdateACC,
    onUpdateJAML: props.onUpdateJAML,
    onUpdateWS: props.onUpdateWS,
    onClickItem: props.onClickItem,
  };
};

/** Connects memory, address/data formats and responsive display values to the memory section. */
export const createMemoryBindings = (props: ProcessorDiagramProps, isMobile: boolean): MemorySectionProps => {
  const { wordBits = 8, decSigned = false } = props;

  return {
    A: props.A,
    S: props.S,
    mem: props.mem,
    signals: props.signals,
    formatNumber: props.formatNumber,
    decToCommand: props.decToCommand,
    decToArgument: props.decToArgument,
    onClickItem: props.onClickItem,
    wordBits,
    aFormat: props.registerFormats.A,
    sFormat: props.registerFormats.S,
    onUpdateAFormat: (value: NumberFormat) => props.onUpdateNumberFormat?.({ field: 'A', value }),
    onUpdateSFormat: (value: NumberFormat) => props.onUpdateNumberFormat?.({ field: 'S', value }),
    onUpdateA: props.onUpdateA,
    onUpdateS: props.onUpdateS,
    onUpdateMem: props.onUpdateMem,
    mobileView: isMobile,
    busAValue: props.BusA,
    busSValue: props.BusS,
    signedDec: decSigned,
    showInvisibleRegisters: props.extras.showInvisibleRegisters,
  };
};
