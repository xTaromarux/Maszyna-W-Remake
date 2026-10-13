'use client';

import { useEffect, useState } from 'react';

/** A deterministic initial width keeps the server and first client render equal. */
export default function useWindowWidth() {
  const [width, setWidth] = useState(1440);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return width;
}
