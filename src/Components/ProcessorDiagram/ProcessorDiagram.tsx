'use client';

import useWindowWidth from '@/Shared/Hooks/UseWindowWidth';
import type { ProcessorDiagramProps } from '@/Components/ProcessorDiagram/Types';
import APRegisterSection from './Registers/ApRegisterSection';
import BusSignal from './Ui/BusSignal';
import AluSection from './AluSection/AluSection';
import CounterComponent from './Registers/CounterComponent';
import GRegisterSection from './Registers/GRegisterSection';
import MemorySection from './MemorySection/MemorySection';
import RBRegisterSection from './Registers/RbRegisterSection';
import RegisterISection from './Registers/RegisterISection';
import RMRegisterSection from './Registers/RmRegisterSection';
import SignalButton from './Ui/SignalButton';
import WSRegisterSection from './Registers/WsRegisterSection';
import XRegisterSection from './Registers/XRegisterSection';
import YRegisterSection from './Registers/YRegisterSection';
import { createRegisterBindings } from './Bindings/RegisterBindings';
import { createAluBindings, createMemoryBindings } from './Bindings/DiagramBindings';
import InterruptLayer from './Ui/InterruptLayer';
import MobileAluSignals from './Ui/MobileAluSignals';

const ProcessorDiagram = (props: ProcessorDiagramProps) => {
  const { manualMode, signals, programCounter, formatNumber, extras, BusA, BusS, I, X, Y, RB, G, RM, AP, RZ, RP, WS, onClickItem } = props;
  const isMobile = useWindowWidth() <= 768;
  const registers = createRegisterBindings(props);

  const alu = createAluBindings(props);
  const memory = createMemoryBindings(props, isMobile);

  const busProps = (name: 'A' | 'S', value: number) => ({
    signalStatus: signals[`bus${name}`],
    busValue: value,
    busName: name,
    mobileView: isMobile,
    showInvisibleRegisters: extras.showInvisibleRegisters,
    formatNumber,
  });
  const ioRegisters = (
    <>
      <RBRegisterSection visible={extras.io?.rbRegister} RB={RB} {...registers.RB} />
      <GRegisterSection visible={extras.io?.gRegister} G={G} {...registers.G} />
    </>
  );

  return (
    <div id="W" className={manualMode ? 'manualMode' : ''}>
      <InterruptLayer extras={extras} signals={signals} RZ={RZ} RP={RP} onClickItem={onClickItem} registers={registers} />
      <div className="layer">
        <CounterComponent programCounter={programCounter} extras={extras} {...registers.L} />
        <RMRegisterSection visible={extras.interrupts?.rmRegister} RM={RM} {...registers.RM} />
        <APRegisterSection visible={extras.interrupts?.apRegister} AP={AP} {...registers.AP} />
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
          <RegisterISection I={I} {...registers.I} />
          {!isMobile && <AluSection {...alu} />}
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
          <MemorySection {...memory} />
        </div>
      </div>
      <BusSignal {...busProps('S', BusS)} />
      <div id="layer3" className="layer layerCenter">
        <XRegisterSection visible={extras.xRegister} X={X} {...registers.X} />
        {isMobile && <MobileAluSignals signals={signals} onClickItem={onClickItem} />}
        <YRegisterSection visible={extras.yRegister} Y={Y} {...registers.Y} />
        {!isMobile && ioRegisters}
      </div>
      {isMobile && (
        <>
          <div id="layer4" className="layer">
            <AluSection {...alu} />
          </div>
          <div className="layer">{ioRegisters}</div>
          {extras.stack?.wsRegister && <BusSignal {...busProps('S', BusS)} />}
          <div className="layer">
            <WSRegisterSection WS={WS} BusS={BusS} visible={extras.stack?.wsRegister} extras={extras} {...registers.WS} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProcessorDiagram;
