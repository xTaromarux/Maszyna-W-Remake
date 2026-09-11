'use client';

import CounterComponent from './CounterComponent';
import BusSignal from './BusSignal';
import SignalButton from './SignalButton';
import MemorySection from './MemorySection';
import CalcSection from './CalcSection';
import RegisterISection from './RegisterISection';
import XRegisterSection from './XRegisterSection';
import YRegisterSection from './YRegisterSection';
import RBRegisterSection from './RBRegisterSection';
import GRegisterSection from './GRegisterSection';
import RMRegisterSection from './RMRegisterSection';
import APRegisterSection from './APRegisterSection';
import RZRegisterSection from './RZRegisterSection';
import RPRegisterSection from './RPRegisterSection';
import WSRegisterSection from './WSRegisterSection';
import useWindowWidth from '@/hooks/useWindowWidth';

export default function MaszynaW(props) {
  const { manualMode, signals, programCounter, formatNumber, registerFormats, extras, BusA, BusS, I, ACC, JAML, A, S, mem, X, Y, RB, G, RM, AP, RZ, RP, WS, rzInputs, wordBits = 8, decSigned = false, decToCommand, decToArgument, onClickItem, onUpdateNumberFormat } = props;
  const isMobile = useWindowWidth() <= 768;
  const hasAnyInterrupts = Object.values(extras.interrupts || {}).some(Boolean);
  const registerProps = (name) => ({
    signals,
    formatNumber,
    numberFormat: registerFormats[name],
    onUpdateNumberFormat: (value) => onUpdateNumberFormat?.({ field: name, value }),
    onClickItem,
    [`onUpdate${name}`]: props[`onUpdate${name}`],
  });
  const calcProps = {
    signals, extras, ACC, JAML, WS, decSigned, wordBits, formatNumber,
    numberFormat: registerFormats.WS,
    accFormat: registerFormats.ACC,
    jamlFormat: registerFormats.JAML,
    onUpdateAccFormat: (value) => onUpdateNumberFormat?.({ field: 'ACC', value }),
    onUpdateNumberFormat: (value) => onUpdateNumberFormat?.({ field: 'WS', value }),
    onUpdateJamlFormat: (value) => onUpdateNumberFormat?.({ field: 'JAML', value }),
    onUpdateACC: props.onUpdateACC,
    onUpdateJAML: props.onUpdateJAML,
    onUpdateWS: props.onUpdateWS,
    onClickItem,
  };
  const busProps = (name, value) => ({ signalStatus: signals[`bus${name}`], busValue: value, busName: name, mobileView: isMobile, showInvisibleRegisters: extras.showInvisibleRegisters, ...registerProps(`Bus${name}`) });
  const ioRegisters = <>
    <RBRegisterSection visible={extras.io?.rbRegister} RB={RB} {...registerProps('RB')} />
    <GRegisterSection visible={extras.io?.gRegister} G={G} {...registerProps('G')} />
  </>;

  return <div id="W" className={manualMode ? 'manualMode' : ''}>
    {hasAnyInterrupts && <div className="layer">
      <RZRegisterSection visible={extras.interrupts?.rzRegister} RZ={RZ} rzInputs={rzInputs} onUpdateRzInputs={props.onUpdateRzInputs} {...registerProps('RZ')} />
      <RPRegisterSection visible={extras.interrupts?.rpRegister} RP={RP} {...registerProps('RP')} />
      <div className="additionalInterruptsSignalsConteiner">
        {extras.interrupts?.rintSignal && <SignalButton id="rint" signal={signals.rint} label="rint" spanClassNames="arrowLeftOnBottom additionalInterruptsSignal" onClick={() => onClickItem?.('rint')} />}
        {extras.interrupts?.eniSignal && <SignalButton id="eni" signal={signals.eni} label="eni" spanClassNames="arrowLeftOnBottom additionalInterruptsSignal" onClick={() => onClickItem?.('eni')} />}
      </div>
    </div>}
    <div className="layer">
      <CounterComponent programCounter={programCounter} extras={extras} onUpdateProgramCounter={props.onUpdateProgramCounter} {...registerProps('L')} />
      <RMRegisterSection visible={extras.interrupts?.rmRegister} RM={RM} {...registerProps('RM')} />
      <APRegisterSection visible={extras.interrupts?.apRegister} AP={AP} {...registerProps('AP')} />
    </div>
    <div className="wylsBusConteiner">
      {extras.stack?.wylsSignal && <div className="wylsBusDiv"><div className="wylsBusExt" /></div>}
      <BusSignal {...busProps('A', BusA)} />
    </div>
    <div className="layer layerNoGap">
      {extras.stack?.wylsSignal && <div className="wylsConteiner">
        <SignalButton id="wyls" signal={signals.wyls} label="wyls" divClassNames={isMobile ? 'impulse pathDownOnLeft' : 'impulse pathDownOnRight'} spanClassNames={isMobile ? 'lineLeftOnBottom' : 'lineRightOnBottom'} onClick={() => onClickItem?.('wyls')} />
      </div>}
      <div className="layer">
        <RegisterISection I={I} {...registerProps('I')} />
        {!isMobile && <CalcSection {...calcProps} />}
        {extras.busConnectors && <>
          <SignalButton id="sa" signal={signals.sa} label="sa" divClassNames="pathUpOnRight" spanClassNames="lineRightOnBottom" onClick={() => onClickItem?.('sa')} />
          <SignalButton id="as" signal={signals.as} label="as" divClassNames="pathDownOnLeft" spanClassNames="lineLeftOnBottom" onClick={() => onClickItem?.('as')} />
        </>}
        <MemorySection
          {...{ A, S, mem, signals, formatNumber, decToCommand, decToArgument, onClickItem, wordBits }}
          aFormat={registerFormats.A}
          sFormat={registerFormats.S}
          onUpdateAFormat={(value) => onUpdateNumberFormat?.({ field: 'A', value })}
          onUpdateSFormat={(value) => onUpdateNumberFormat?.({ field: 'S', value })}
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
      {isMobile && <>
        <SignalButton id="weja" signal={signals.weja} label="weja" style={{ height: '91%', minHeight: 40 }} divClassNames="pathDownOnRight" spanClassNames="arrowRightOnBottom" onClick={() => onClickItem?.('weja')} />
        <SignalButton id="wyak" signal={signals.wyak} label="wyak" style={{ height: '91%', minHeight: 40 }} divClassNames="pathUpOnLeft" spanClassNames="arrowLeftOnBottom" onClick={() => onClickItem?.('wyak')} />
      </>}
      <YRegisterSection visible={extras.yRegister} Y={Y} {...registerProps('Y')} />
      {!isMobile && ioRegisters}
    </div>
    {isMobile && <>
      <div id="layer4" className="layer"><CalcSection {...calcProps} /></div>
      <div className="layer">{ioRegisters}</div>
      {extras.stack?.wsRegister && <BusSignal {...busProps('S', BusS)} />}
      <div className="layer">
        <WSRegisterSection WS={WS} BusS={BusS} visible={extras.stack?.wsRegister} extras={extras} {...registerProps('WS')} />
      </div>
    </>}
  </div>;
}
