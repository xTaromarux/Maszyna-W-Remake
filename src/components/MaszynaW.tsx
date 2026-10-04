'use client';

import useWindowWidth from '@/hooks/useWindowWidth';
import type { NumberFormat } from '@/types/common';
import type { MaszynaWProps } from '@/types/components';
import type { RegisterFormatField } from '@/types/simulator';
import APRegisterSection from './registers/APRegisterSection';
import BusSignal from './BusSignal';
import CalcSection from './CalcSection';
import CounterComponent from './registers/CounterComponent';
import GRegisterSection from './registers/GRegisterSection';
import MemorySection from './MemorySection';
import RBRegisterSection from './registers/RBRegisterSection';
import RegisterISection from './registers/RegisterISection';
import RMRegisterSection from './registers/RMRegisterSection';
import RPRegisterSection from './registers/RPRegisterSection';
import RZRegisterSection from './registers/RZRegisterSection';
import SignalButton from './SignalButton';
import WSRegisterSection from './registers/WSRegisterSection';
import XRegisterSection from './registers/XRegisterSection';
import YRegisterSection from './registers/YRegisterSection';

export default function MaszynaW(props: MaszynaWProps) {
  const {
    manualMode,
    signals,
    programCounter,
    formatNumber,
    registerFormats,
    extras,
    BusA,
    BusS,
    I,
    ACC,
    JAML,
    A,
    S,
    mem,
    X,
    Y,
    RB,
    G,
    RM,
    AP,
    RZ,
    RP,
    WS,
    rzInputs,
    wordBits = 8,
    decSigned = false,
    decToCommand,
    decToArgument,
    onClickItem,
    onUpdateNumberFormat,
  } = props;
  const isMobile = useWindowWidth() <= 768;
  const hasAnyInterrupts = Object.values(extras.interrupts || {}).some(Boolean);
  const registerProps = (name: RegisterFormatField) => ({
    signals,
    formatNumber,
    numberFormat: registerFormats[name],
    onUpdateNumberFormat: (value: NumberFormat) => onUpdateNumberFormat?.({ field: name, value }),
    onClickItem,
    [`onUpdate${name}`]: name === 'L' ? props.onUpdateProgramCounter : props[`onUpdate${name}`],
  });
  const calcProps = {
    signals,
    extras,
    ACC,
    JAML,
    WS,
    decSigned,
    wordBits,
    formatNumber,
    numberFormat: registerFormats.WS,
    accFormat: registerFormats.ACC,
    jamlFormat: registerFormats.JAML,
    onUpdateAccFormat: (value: NumberFormat) => onUpdateNumberFormat?.({ field: 'ACC', value }),
    onUpdateNumberFormat: (value: NumberFormat) => onUpdateNumberFormat?.({ field: 'WS', value }),
    onUpdateJamlFormat: (value: NumberFormat) => onUpdateNumberFormat?.({ field: 'JAML', value }),
    onUpdateACC: props.onUpdateACC,
    onUpdateJAML: props.onUpdateJAML,
    onUpdateWS: props.onUpdateWS,
    onClickItem,
  };
  const busProps = (name: 'A' | 'S', value: number) => ({
    signalStatus: signals[`bus${name}`],
    busValue: value,
    busName: name,
    mobileView: isMobile,
    showInvisibleRegisters: extras.showInvisibleRegisters,
    ...registerProps(`Bus${name}`),
  });
  const ioRegisters = (
    <>
      <RBRegisterSection visible={extras.io?.rbRegister} RB={RB} {...registerProps('RB')} />
      <GRegisterSection visible={extras.io?.gRegister} G={G} {...registerProps('G')} />
    </>
  );

  return (
    <div id="W" className={manualMode ? 'manualMode' : ''}>
      {hasAnyInterrupts && (
        <div className="layer">
          <RZRegisterSection
            visible={extras.interrupts?.rzRegister}
            RZ={RZ}
            rzInputs={rzInputs}
            onUpdateRzInputs={props.onUpdateRzInputs}
            {...registerProps('RZ')}
          />
          <RPRegisterSection visible={extras.interrupts?.rpRegister} RP={RP} {...registerProps('RP')} />
          <div className="additionalInterruptsSignalsConteiner">
            {extras.interrupts?.rintSignal && (
              <SignalButton
                id="rint"
                signal={signals.rint}
                label="rint"
                spanClassNames="arrowLeftOnBottom additionalInterruptsSignal"
                onClick={() => onClickItem?.('rint')}
              />
            )}
            {extras.interrupts?.eniSignal && (
              <SignalButton
                id="eni"
                signal={signals.eni}
                label="eni"
                spanClassNames="arrowLeftOnBottom additionalInterruptsSignal"
                onClick={() => onClickItem?.('eni')}
              />
            )}
          </div>
        </div>
      )}
      <div className="layer">
        <CounterComponent
          programCounter={programCounter}
          extras={extras}
          onUpdateProgramCounter={props.onUpdateProgramCounter}
          {...registerProps('L')}
        />
        <RMRegisterSection visible={extras.interrupts?.rmRegister} RM={RM} {...registerProps('RM')} />
        <APRegisterSection visible={extras.interrupts?.apRegister} AP={AP} {...registerProps('AP')} />
      </div>
      <div className="wylsBusConteiner">
        {extras.stack?.wylsSignal && (
          <div className="wylsBusDiv">
            <div className="wylsBusExt" />
          </div>
        )}
        <BusSignal {...busProps('A', BusA)} />
      </div>
      <div className="layer layerNoGap">
        {extras.stack?.wylsSignal && (
          <div className="wylsConteiner">
            <SignalButton
              id="wyls"
              signal={signals.wyls}
              label="wyls"
              divClassNames={isMobile ? 'impulse pathDownOnLeft' : 'impulse pathDownOnRight'}
              spanClassNames={isMobile ? 'lineLeftOnBottom' : 'lineRightOnBottom'}
              onClick={() => onClickItem?.('wyls')}
            />
          </div>
        )}
        <div className="layer">
          <RegisterISection I={I} {...registerProps('I')} />
          {!isMobile && <CalcSection {...calcProps} />}
          {extras.busConnectors && (
            <>
              <SignalButton
                id="sa"
                signal={signals.sa}
                label="sa"
                divClassNames="pathUpOnRight"
                spanClassNames="lineRightOnBottom"
                onClick={() => onClickItem?.('sa')}
              />
              <SignalButton
                id="as"
                signal={signals.as}
                label="as"
                divClassNames="pathDownOnLeft"
                spanClassNames="lineLeftOnBottom"
                onClick={() => onClickItem?.('as')}
              />
            </>
          )}
          <MemorySection
            {...{ A, S, mem, signals, formatNumber, decToCommand, decToArgument, onClickItem, wordBits }}
            aFormat={registerFormats.A}
            sFormat={registerFormats.S}
            onUpdateAFormat={(value: NumberFormat) => onUpdateNumberFormat?.({ field: 'A', value })}
            onUpdateSFormat={(value: NumberFormat) => onUpdateNumberFormat?.({ field: 'S', value })}
            onUpdateA={props.onUpdateA}
            onUpdateS={props.onUpdateS}
            onUpdateMem={props.onUpdateMem}
            mobileView={isMobile}
            busAValue={BusA}
            busSValue={BusS}
            signedDec={decSigned}
            showInvisibleRegisters={extras.showInvisibleRegisters}
          />
        </div>
      </div>
      <BusSignal {...busProps('S', BusS)} />
      <div id="layer3" className="layer layerCenter">
        <XRegisterSection visible={extras.xRegister} X={X} {...registerProps('X')} />
        {isMobile && (
          <>
            <SignalButton
              id="weja"
              signal={signals.weja}
              label="weja"
              style={{ height: '91%', minHeight: 40 }}
              divClassNames="pathDownOnRight"
              spanClassNames="arrowRightOnBottom"
              onClick={() => onClickItem?.('weja')}
            />
            <SignalButton
              id="wyak"
              signal={signals.wyak}
              label="wyak"
              style={{ height: '91%', minHeight: 40 }}
              divClassNames="pathUpOnLeft"
              spanClassNames="arrowLeftOnBottom"
              onClick={() => onClickItem?.('wyak')}
            />
          </>
        )}
        <YRegisterSection visible={extras.yRegister} Y={Y} {...registerProps('Y')} />
        {!isMobile && ioRegisters}
      </div>
      {isMobile && (
        <>
          <div id="layer4" className="layer">
            <CalcSection {...calcProps} />
          </div>
          <div className="layer">{ioRegisters}</div>
          {extras.stack?.wsRegister && <BusSignal {...busProps('S', BusS)} />}
          <div className="layer">
            <WSRegisterSection WS={WS} BusS={BusS} visible={extras.stack?.wsRegister} extras={extras} {...registerProps('WS')} />
          </div>
        </>
      )}
    </div>
  );
}
