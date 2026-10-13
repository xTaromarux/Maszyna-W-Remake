'use client';

import useWindowWidth from '@/Shared/Hooks/UseWindowWidth';
import type { MemorySectionProps } from '@/Components/ProcessorDiagram/MemorySection/Types';
import { useEffect, useState } from 'react';
import MemoryContent from './Ui/MemoryContent';
import MobileMemoryHeader from './Ui/MobileMemoryHeader';
import MobileMemoryDialog from './Ui/MobileMemoryDialog';

const MemorySection = (props: MemorySectionProps) => {
  const isMobile = useWindowWidth() < 1080;
  const [showMobileDialog, setShowMobileDialog] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setShowMobileDialog(false);
    }
  }, [isMobile]);

  const closeMobileDialog = () => setShowMobileDialog(false);

  return (
    <div className="memorySection">
      {isMobile && <MobileMemoryHeader {...props} onOpen={() => setShowMobileDialog(true)} />}
      {isMobile && showMobileDialog && <MobileMemoryDialog memory={props} onClose={closeMobileDialog} />}
      {!isMobile && <MemoryContent {...props} />}
    </div>
  );
};

export default MemorySection;
