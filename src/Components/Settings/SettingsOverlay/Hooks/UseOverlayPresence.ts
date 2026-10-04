import { useEffect, useState } from 'react';

const ENTER_DELAY_MS = 10;
const EXIT_DURATION_MS = 400;

/** Mounts before the entrance animation and keeps the overlay present until its exit animation ends. */
export const useOverlayPresence = (visible: boolean) => {
  const [open, setOpen] = useState(visible);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (visible) {
      setOpen(true);
      const timer = setTimeout(() => setIsAnimated(true), ENTER_DELAY_MS);
      return () => clearTimeout(timer);
    }

    setIsAnimated(false);
    const timer = setTimeout(() => setOpen(false), EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  return { open, isAnimated };
};
