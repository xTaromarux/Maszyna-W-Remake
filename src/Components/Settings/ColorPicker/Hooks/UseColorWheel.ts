import type { PointerEvent } from 'react';
import { useEffect, useRef } from 'react';
import { calculateWheelSelection, drawColorWheel } from '../Helpers/ColorWheel';

interface ColorWheelOptions {
  size: number;
  onSelect: (selection: { h: number; s: number }) => void;
}

/** Draws the wheel and keeps pointer selection active until capture ends or the component unmounts. */
export const useColorWheel = ({ size, onSelect }: ColorWheelOptions) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const activePointer = useRef<{ element: HTMLDivElement; id: number } | null>(null);

  const releasePointer = () => {
    const pointer = activePointer.current;
    activePointer.current = null;

    if (pointer?.element.hasPointerCapture?.(pointer.id)) {
      pointer.element.releasePointerCapture(pointer.id);
    }
  };

  useEffect(() => {
    if (canvas.current) {
      drawColorWheel(canvas.current, size, window.devicePixelRatio);
    }
  }, [size]);

  useEffect(() => releasePointer, []);

  const selectAtPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }

    onSelect(calculateWheelSelection(event.clientX - bounds.left, event.clientY - bounds.top, bounds.width, bounds.height));
  };

  const startPicking = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    releasePointer();
    activePointer.current = { element: event.currentTarget, id: event.pointerId };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    selectAtPointer(event);
  };

  const continuePicking = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current?.id === event.pointerId) {
      selectAtPointer(event);
    }
  };

  const stopPicking = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current?.id === event.pointerId) {
      releasePointer();
    }
  };

  return { canvas, startPicking, continuePicking, stopPicking };
};
