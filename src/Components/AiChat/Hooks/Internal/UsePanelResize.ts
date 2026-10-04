import { clamp } from '@/Shared/Utils/Numbers';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PANEL_WIDTH, MAX_WIDTH, MIN_WIDTH } from '../../ChatConfig';
import { persistPanelWidth, restorePanelWidth } from '../../Storage/ChatStorage';

interface ResizeGesture {
  pointerId: number;
  startX: number;
  startWidth: number;
  width: number;
  previousCursor: string;
}

/** Restores panel width and saves it when a captured pointer gesture ends. */
export const usePanelResize = (visible: boolean) => {
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const gesture = useRef<ResizeGesture | null>(null);

  const stopResize = useCallback(() => {
    const activeGesture = gesture.current;
    if (!activeGesture) {
      return;
    }

    gesture.current = null;
    document.body.style.cursor = activeGesture.previousCursor;
    persistPanelWidth(activeGesture.width);
  }, []);

  useEffect(() => {
    setPanelWidth(restorePanelWidth());
    return stopResize;
  }, [stopResize]);

  useEffect(() => {
    if (!visible) {
      stopResize();
    }
  }, [visible, stopResize]);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (gesture.current) {
      return;
    }

    event.preventDefault();
    // Pointer capture keeps subsequent events on the handle outside its bounds.
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: panelWidth,
      width: panelWidth,
      previousCursor: document.body.style.cursor,
    };
    document.body.style.cursor = 'ew-resize';
  };

  const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const activeGesture = gesture.current;
    if (!activeGesture || activeGesture.pointerId !== event.pointerId) {
      return;
    }

    const horizontalDelta = activeGesture.startX - event.clientX;
    const width = clamp(activeGesture.startWidth + horizontalDelta, MIN_WIDTH, MAX_WIDTH);
    activeGesture.width = width;
    setPanelWidth(width);
  };

  const finishResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (gesture.current?.pointerId === event.pointerId) {
      stopResize();
    }
  };

  const resizeHandleProps = {
    onPointerDown: startResize,
    onPointerMove: moveResize,
    onPointerUp: finishResize,
    onPointerCancel: finishResize,
    onLostPointerCapture: finishResize,
  };

  return { panelWidth, resizeHandleProps };
};
