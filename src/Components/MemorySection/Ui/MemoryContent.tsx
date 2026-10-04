'use client';

import useWindowWidth from '@/Shared/Hooks/UseWindowWidth';
import type { MemoryContentProps } from '@/Types/Components';
import RegisterComponent from '../../Registers/RegisterComponent';
import SignalButton from '../../SignalButton';
import { useMemoryValues } from '../Hooks/UseMemoryValues';
import MemoryTable from './MemoryTable';

const MemoryContent = ({
  A,
  S,
  mem,
  signals,
  formatNumber,
  decToCommand,
  decToArgument,
  aFormat,
  sFormat,
  signedDec = false,
  wordBits = 8,
  onUpdateA,
  onUpdateS,
  onUpdateMem,
  onClickItem,
  onUpdateAFormat,
  onUpdateSFormat,
}: MemoryContentProps) => {
  const width = useWindowWidth();
  const isMobile = width < 1080;
  const memoryValues = useMemoryValues({ mem, onUpdateMem, wordBits, signedDec });

  return (
    <div id="memory">
      {!isMobile && (
        <SignalButton
          id="wea"
          signal={signals.wea}
          label="wea"
          divClassNames="pathDownOnRight"
          spanClassNames="arrowRightOnBottom"
          onClick={() => onClickItem?.('wea')}
        />
      )}
      <RegisterComponent
        classNames="register"
        id="aRegister"
        label="A"
        model={A}
        onUpdateModel={onUpdateA}
        numberFormat={aFormat}
        onUpdateNumberFormat={onUpdateAFormat}
      />
      <MemoryTable
        A={A}
        mem={mem}
        formatNumber={formatNumber}
        decToCommand={decToCommand}
        decToArgument={decToArgument}
        width={width}
        {...memoryValues}
      />
      <RegisterComponent
        classNames="register"
        id="sRegister"
        label="S"
        model={S}
        onUpdateModel={onUpdateS}
        numberFormat={sFormat}
        onUpdateNumberFormat={onUpdateSFormat}
      />
      {!isMobile && (
        <>
          <div id="operations">
            <SignalButton
              id="czyt"
              signal={signals.czyt}
              label="czyt"
              spanClassNames="lineLeftOnBottom"
              onClick={() => onClickItem?.('czyt')}
            />
            <SignalButton
              id="pisz"
              signal={signals.pisz}
              label="pisz"
              spanClassNames="lineLeftOnBottom"
              onClick={() => onClickItem?.('pisz')}
            />
          </div>
          <div className="signals">
            <SignalButton
              id="wes"
              signal={signals.wes}
              label="wes"
              divClassNames="pathUpOnRight"
              spanClassNames="arrowRightOnBottom"
              onClick={() => onClickItem?.('wes')}
            />
            <SignalButton
              id="wys"
              signal={signals.wys}
              label="wys"
              divClassNames="pathDownOnLeft"
              spanClassNames="lineLeftOnBottom"
              onClick={() => onClickItem?.('wys')}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MemoryContent;
