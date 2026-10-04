'use client';

import useWindowWidth from '@/Shared/Hooks/UseWindowWidth';
import type { GRegisterSectionProps } from '@/Types/Components';
import RegisterComponent from './RegisterComponent';
import SignalButton from '../SignalButton';

const GRegisterSection = ({ visible, G, signals, numberFormat, onUpdateG, onUpdateNumberFormat, onClickItem }: GRegisterSectionProps) => {
  const isMobile = useWindowWidth() <= 768;
  if (!visible) {
    return null;
  }

  return (
    <div id="gRegister">
      <SignalButton
        id="wyg"
        signal={signals.wyg}
        label="wyg"
        divClassNames={isMobile ? 'pathDownOnRight' : 'pathUpOnRight'}
        spanClassNames="lineRightOnBottom"
        onClick={() => onClickItem?.('wyg')}
      />
      <RegisterComponent
        label="G"
        model={G}
        onUpdateModel={onUpdateG}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
      <SignalButton
        id="start"
        signal={signals.start}
        label="start"
        divClassNames={isMobile ? 'pathUpOnLeft' : 'pathDownOnLeft'}
        spanClassNames="arrowLeftOnBottom"
        onClick={() => onClickItem?.('start')}
      />
    </div>
  );
};

export default GRegisterSection;
