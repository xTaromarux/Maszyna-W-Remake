const FOCUSABLE_ELEMENT_SELECTOR = [
  'button:not(:disabled)',
  'input:not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const getFocusableElements = (dialog: HTMLElement): HTMLElement[] => {
  const candidates = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR));

  return candidates.filter((element) => {
    const isVisible = element.getClientRects().length > 0;
    const isInert = element.closest('[inert]') !== null;
    return isVisible && !isInert;
  });
};

/** Wraps Tab at dialog boundaries; leaves normal navigation to the browser. */
export const trapDialogTab = (event: KeyboardEvent, dialog: HTMLElement): void => {
  if (event.key !== 'Tab') {
    return;
  }

  const elements = getFocusableElements(dialog);
  const firstElement = elements[0];
  const lastElement = elements.at(-1);
  if (!firstElement || !lastElement) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  const activeElement = document.activeElement;
  const focusIsOutsideTabOrder = !(activeElement instanceof HTMLElement) || !elements.includes(activeElement);
  const exitBoundary = event.shiftKey ? firstElement : lastElement;
  const shouldWrapFocus = focusIsOutsideTabOrder || activeElement === exitBoundary;
  if (!shouldWrapFocus) {
    return;
  }

  event.preventDefault();
  const nextElement = event.shiftKey ? lastElement : firstElement;
  nextElement.focus();
};
