'use client';

import useWindowWidth from '@/Hooks/UseWindowWidth';
import type { RBRegisterSectionProps } from '@/Types/Components';
import RegisterComponent from './RegisterComponent';
import SignalButton from '../SignalButton';

export default function RBRegisterSection({
  visible,
  RB,
  signals,
  numberFormat,
  onUpdateRB,
  onUpdateNumberFormat,
  onClickItem,
}: RBRegisterSectionProps) {
  const isMobile = useWindowWidth() <= 768;
  if (!visible) return null;
  return (
    <div id="rbRegister">
      <SignalButton
        id="wyrb"
        signal={signals.wyrb}
        label="wyrb"
        divClassNames={isMobile ? 'pathDownOnRight' : 'pathUpOnRight'}
        spanClassNames="lineRightOnBottom"
        onClick={() => onClickItem?.('wyrb')}
      />
      <RegisterComponent
        label="RB"
        model={RB}
        onUpdateModel={onUpdateRB}
        numberFormat={numberFormat}
        onUpdateNumberFormat={onUpdateNumberFormat}
      />
      <SignalButton
        id="werb"
        signal={signals.werb}
        label="werb"
        divClassNames={isMobile ? 'pathUpOnLeft' : 'pathDownOnLeft'}
        spanClassNames="arrowLeftOnBottom"
        onClick={() => onClickItem?.('werb')}
      />
    </div>
  );
}
