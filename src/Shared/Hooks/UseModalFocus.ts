'use client';

import { useEffect, useRef } from 'react';

const dialogs: symbol[] = [];
let scrollLocks = 0;
let savedOverflow = '';

const lockScrolling = () => {
  if (scrollLocks === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLocks += 1;
};

const unlockScrolling = () => {
  scrollLocks -= 1;
  if (scrollLocks === 0) {
    document.body.style.overflow = savedOverflow;
  }
};

const focusableElements = (root: HTMLElement): HTMLElement[] =>
  [
    ...root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ),
  ].filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);

/** Keeps focus and Escape in the topmost dialog, locks scrolling, and restores focus on close. */
export const useModalFocus = <T extends HTMLElement = HTMLDivElement>(visible: boolean, onClose?: () => void) => {
  const dialog = useRef<T>(null);
  const latestClose = useRef(onClose);
  latestClose.current = onClose;

  useEffect(() => {
    const root = dialog.current;
    if (!visible || !root) {
      return;
    }

    const token = Symbol('dialog');
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogs.push(token);
    lockScrolling();
    root.focus();

    const isTopmost = () => dialogs.at(-1) === token;
    const handleKey = (event: KeyboardEvent) => {
      if (!isTopmost()) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        latestClose.current?.();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const elements = focusableElements(root);
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) {
        event.preventDefault();
        root.focus();
        return;
      }

      const active = document.activeElement;
      const outsideTabOrder = !elements.includes(active as HTMLElement);
      if (event.shiftKey && (active === first || outsideTabOrder)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outsideTabOrder)) {
        event.preventDefault();
        first.focus();
      }
    };

    const keepFocus = (event: FocusEvent) => {
      if (isTopmost() && event.target instanceof Node && !root.contains(event.target)) {
        root.focus();
      }
    };

    document.addEventListener('keydown', handleKey, true);
    document.addEventListener('focusin', keepFocus);

    return () => {
      document.removeEventListener('keydown', handleKey, true);
      document.removeEventListener('focusin', keepFocus);
      const index = dialogs.indexOf(token);
      if (index >= 0) {
        dialogs.splice(index, 1);
      }
      unlockScrolling();
      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [visible]);

  return dialog;
};
